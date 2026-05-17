import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BellRing, ShieldAlert, Navigation } from 'lucide-react';
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

export default function LiveGPSMap() {
  const [userLocation, setUserLocation] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    const fetchAnomalies = async (lat, lon) => {
      try {
        const response = await axios.get(`http://localhost:8000/api/v1/events/nearby-events?lat=${lat}&lon=${lon}`);
        setAnomalies(response.data);

        // Check if any anomaly is very close (e.g., within ~50 meters approx 0.0005 degrees)
        const closeAnomalies = response.data.filter(a => {
          const distLat = Math.abs(a.latitude - lat);
          const distLon = Math.abs(a.longitude - lon);
          return distLat < 0.0005 && distLon < 0.0005;
        });

        if (closeAnomalies.length > 0) {
          setAlert(true);
          // Optional: play a warning sound here
          setTimeout(() => setAlert(false), 5000);
        }
      } catch (err) {
        console.error("Failed to fetch nearby anomalies", err);
      }
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

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Live GPS Monitoring</h1>
          <p className="text-slate-400">Real-time smart city road health tracking</p>
        </div>
      </div>

      {alert && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
          <ShieldAlert className="h-6 w-6 text-red-400 animate-pulse" />
          <span className="font-bold">⚠ Road anomaly detected nearby! Please slow down.</span>
        </div>
      )}

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
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
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
            {anomalies.map((anomaly, idx) => (
              <Marker
                key={idx}
                position={[anomaly.latitude, anomaly.longitude]}
                icon={getSeverityIcon(anomaly.severity)}
              >
                <Popup>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold capitalize text-slate-900">{anomaly.event_type}</span>
                    <span className="text-sm text-slate-600 capitalize">Severity: {anomaly.severity}</span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}

        {/* Floating status badge */}
        {!loading && !error && (
          <div className="absolute bottom-6 right-6 z-[400] flex items-center gap-2 rounded-full bg-slate-900/90 px-4 py-2 text-sm font-medium text-slate-300 shadow-lg border border-slate-700">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-teal-500"></span>
            </span>
            Live Tracking Active
          </div>
        )}
      </div>
    </div>
  );
}
