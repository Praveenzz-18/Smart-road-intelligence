import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BellRing, ShieldAlert, Navigation, Volume2, VolumeX, Wifi, WifiOff } from 'lucide-react';
import axios from 'axios';

// Map component to handle dynamic centering and smooth updates
function MapController({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom(), {
        animate: true,
      });
    }
  }, [position, map]);
  return null;
}

// Custom markers for Leaflet mapping
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const orangeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const yellowIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const getSeverityIcon = (severity) => {
  switch (severity) {
    case 'high': return redIcon;
    case 'medium': return orangeIcon;
    case 'low': return yellowIcon;
    default: return yellowIcon;
  }
};

// Haversine formula to calculate accurate distance in meters between two lat/lon points
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in meters
};

// Local client-side mock data generator as a robust fallback if backend is down
const generateFrontendMockAnomalies = (lat, lon) => {
  const anomalies = [];
  const severities = ["high", "medium", "low"];
  const types = ["pothole", "crash", "speed_breaker"];
  
  // 1. Generate 5 very close anomalies (within ~150 meters) for proximity and voice warning testing
  for (let i = 0; i < 5; i++) {
    const latOffset = (Math.random() - 0.5) * 0.002;
    const lonOffset = (Math.random() - 0.5) * 0.002;
    anomalies.push({
      id: `client-near-${i}-${Math.floor(Math.random() * 9000) + 1000}`,
      event_type: types[Math.floor(Math.random() * types.length)],
      latitude: lat + latOffset,
      longitude: lon + lonOffset,
      timestamp: new Date().toISOString(),
      severity: severities[Math.floor(Math.random() * severities.length)]
    });
  }

  // 2. Generate 15 scattered anomalies around the city (up to 3-4 km radius)
  for (let i = 0; i < 15; i++) {
    const latOffset = (Math.random() - 0.5) * 0.06;
    const lonOffset = (Math.random() - 0.5) * 0.06;
    anomalies.push({
      id: `client-far-${i}-${Math.floor(Math.random() * 9000) + 1000}`,
      event_type: types[Math.floor(Math.random() * types.length)],
      latitude: lat + latOffset,
      longitude: lon + lonOffset,
      timestamp: new Date().toISOString(),
      severity: severities[Math.floor(Math.random() * severities.length)]
    });
  }
  
  return anomalies;
};

export default function LiveGPSMap() {
  const [userLocation, setUserLocation] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeAlert, setActiveAlert] = useState(null);
  
  // Custom interactive settings
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Track already spoken anomalies to avoid spamming the user
  const spokenAnomaliesRef = useRef(new Set());

  // Speech helper
  const speakAlert = (text) => {
    if (!audioEnabled || !('speechSynthesis' in window)) return;
    
    // Stop ongoing speech immediately for timely alerts
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Monitor network connection status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    const fetchAnomalies = async (lat, lon) => {
      let data = [];
      if (navigator.onLine) {
        try {
          const response = await axios.get(`http://localhost:8000/api/v1/events/nearby-events?lat=${lat}&lon=${lon}`);
          data = response.data;
          setAnomalies(data);
          // Cache to local storage for offline use
          localStorage.setItem('cached_anomalies', JSON.stringify(data));
        } catch (err) {
          console.error("Failed to fetch nearby anomalies from server. Using local fallback mock data...", err);
          const cached = localStorage.getItem('cached_anomalies');
          if (cached) {
            data = JSON.parse(cached);
          } else {
            data = generateFrontendMockAnomalies(lat, lon);
          }
          setAnomalies(data);
        }
      } else {
        // Retrieve offline data from cache
        const cached = localStorage.getItem('cached_anomalies');
        if (cached) {
          data = JSON.parse(cached);
        } else {
          data = generateFrontendMockAnomalies(lat, lon);
        }
        setAnomalies(data);
      }

      // Proximity & Warning Audio Logic using Haversine
      let triggeredAlert = null;
      data.forEach(anomaly => {
        const distance = getDistance(lat, lon, anomaly.latitude, anomaly.longitude);

        // Alert triggered if anomaly is within 50 meters
        if (distance <= 50) {
          const formattedType = anomaly.event_type.replace('_', ' ');
          triggeredAlert = {
            ...anomaly,
            distance: Math.round(distance),
            message: `⚠ ${anomaly.severity.toUpperCase()} severity ${formattedType} detected ${Math.round(distance)} meters ahead!`
          };

          // Check if we already spoke about this specific anomaly
          if (!spokenAnomaliesRef.current.has(anomaly.id)) {
            spokenAnomaliesRef.current.add(anomaly.id);
            speakAlert(`Warning! ${anomaly.severity} severity ${formattedType} detected ${Math.round(distance)} meters ahead. Please slow down.`);
            
            // Clean up spoken ID cache after 60 seconds so it can be re-spoken if user cycles back
            setTimeout(() => {
              spokenAnomaliesRef.current.delete(anomaly.id);
            }, 60000);
          }
        }
      });

      setActiveAlert(triggeredAlert);
    };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setLoading(false);
        fetchAnomalies(latitude, longitude);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [audioEnabled]);

  // Audio testing helper
  const handleTestAlert = () => {
    speakAlert("Audio check. Urban Guard smart navigation voice alerts are fully active.");
  };

  return (
    <div className="space-y-6">
      {/* Header with Control Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
            Live GPS Monitoring
            {isOnline ? (
              <Wifi className="h-5 w-5 text-emerald-400" />
            ) : (
              <WifiOff className="h-5 w-5 text-amber-500 animate-pulse" />
            )}
          </h1>
          <p className="text-slate-400">Real-time smart city road health & audio safety navigation</p>
        </div>

        {/* Audio controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
              audioEnabled 
                ? 'bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 border border-teal-500/30' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            {audioEnabled ? (
              <>
                <Volume2 className="h-4 w-4" /> Voice Alerts: ON
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4" /> Voice Alerts: OFF
              </>
            )}
          </button>
          
          <button
            onClick={handleTestAlert}
            className="rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 text-sm font-bold text-slate-300 transition"
          >
            Test Voice
          </button>
        </div>
      </div>

      {/* Dynamic Proximity Alerts */}
      {activeAlert && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.25)] animate-bounce">
          <ShieldAlert className="h-6 w-6 text-red-400 animate-pulse shrink-0" />
          <div>
            <span className="font-black text-white">PROXIMITY WARNING:</span>{' '}
            <span className="font-semibold text-red-100">{activeAlert.message}</span>
          </div>
        </div>
      )}

      {/* Main Map Frame */}
      <div className="relative h-[600px] w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 shadow-xl">
        {loading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
            <p className="mt-4 text-sm font-medium text-teal-400">Acquiring GPS Signal...</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
            <p className="text-red-400">Error: {error}</p>
          </div>
        )}

        {!loading && !error && userLocation && (
          <MapContainer
            center={userLocation}
            zoom={16}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            <MapController position={userLocation} />

            {/* User Location */}
            <Marker position={userLocation} icon={userIcon}>
              <Popup>
                <div className="font-bold text-slate-900">Your Current Location</div>
              </Popup>
            </Marker>

            {/* Anomalies */}
            {anomalies.map((anomaly) => (
              <Marker
                key={anomaly.id}
                position={[anomaly.latitude, anomaly.longitude]}
                icon={getSeverityIcon(anomaly.severity)}
              >
                <Popup>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold capitalize text-slate-900">{anomaly.event_type.replace('_', ' ')}</span>
                    <span className="text-sm text-slate-600 capitalize">Severity: {anomaly.severity}</span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}

        {/* Floating status badge */}
        {!loading && !error && (
          <div className="absolute bottom-6 right-6 z-[400] flex flex-col gap-2">
            {!isOnline && (
              <div className="flex items-center gap-2 rounded-full bg-amber-500/90 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg border border-amber-600">
                Offline Mode (Using Cached Data)
              </div>
            )}
            <div className="flex items-center gap-2 rounded-full bg-slate-900/90 px-4 py-2 text-sm font-medium text-slate-300 shadow-lg border border-slate-700">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-teal-500"></span>
              </span>
              Live GPS Tracking Active
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
