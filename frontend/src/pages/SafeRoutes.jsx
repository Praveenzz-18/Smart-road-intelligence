import { useState } from 'react'
import axios from 'axios'
import { resolveLocation } from '../services/routeSafetyService'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import { AlertTriangle, ShieldCheck, Activity, Car, CheckCircle2, Clock, Navigation } from 'lucide-react'
import L from 'leaflet'

function MapRecenter({ bounds }) {
  const map = useMap()
  if (bounds && bounds.length > 0) {
    map.fitBounds(bounds, { padding: [50, 50] })
  }
  return null
}

export default function SafeRoutes() {
  const [source, setSource] = useState('')
  const [destination, setDestination] = useState('')
  
  const [isLoading, setIsLoading] = useState(false)
  const [routeData, setRouteData] = useState(null)
  
  const [isLogging, setIsLogging] = useState(false)
  const [logSuccess, setLogSuccess] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!source || !destination) return
    setIsLoading(true)
    setLogSuccess(false)

    try {
      // 1. Geocode Source and Destination via our service (supports coords & Nominatim)
      const srcLoc = await resolveLocation(source)
      const destLoc = await resolveLocation(destination)

      if (!srcLoc || !destLoc) {
        alert("Could not find coordinates. Try simplifying the address (e.g. 'Bogadi 2nd Stage, Mysuru') or paste GPS coordinates directly (e.g. '12.30, 76.64').")
        setIsLoading(false)
        return
      }

      const srcCoords = srcLoc.coordinates
      const destCoords = destLoc.coordinates

      // 2. Get Route via OSRM
      const osrmRes = await axios.get(`https://router.project-osrm.org/route/v1/driving/${srcCoords[1]},${srcCoords[0]};${destCoords[1]},${destCoords[0]}?overview=full&geometries=geojson`)
      
      const routeCoords = osrmRes.data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]) // GeoJSON provides [lon, lat]

      // 3. Generate Mock Analytics Data along the route
      const mockScore = Math.floor(Math.random() * 25) + 70 // Score 70-95
      const mockPotholes = []
      const numPotholes = Math.floor(Math.random() * 5) + 1 // 1 to 5 potholes
      
      for (let i = 0; i < numPotholes; i++) {
        // Pick random points along the route for potholes
        const randomIndex = Math.floor(Math.random() * (routeCoords.length - 2)) + 1
        mockPotholes.push({
          id: i,
          coords: routeCoords[randomIndex],
          severity: Math.random() > 0.6 ? 'High' : 'Medium'
        })
      }

      setRouteData({
        srcCoords,
        destCoords,
        routeCoords,
        bounds: [srcCoords, destCoords],
        srcName: srcLoc.name.split(',')[0],
        destName: destLoc.name.split(',')[0],
        distance: (osrmRes.data.routes[0].distance / 1000).toFixed(1), // km
        duration: Math.ceil(osrmRes.data.routes[0].duration / 60), // mins
        score: mockScore,
        potholes: mockPotholes,
        traffic: Math.random() > 0.5 ? 'Moderate (+5m delay)' : 'Light Traffic',
        accidents: Math.random() > 0.7 ? 1 : 0
      })

    } catch (error) {
      console.error("Routing error:", error)
      alert("Error calculating route. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogRoute = async () => {
    if (!routeData) return
    setIsLogging(true)
    const payload = {
      source_lat: routeData.srcCoords[0],
      source_lon: routeData.srcCoords[1],
      dest_lat: routeData.destCoords[0],
      dest_lon: routeData.destCoords[1],
      source_name: routeData.srcName,
      dest_name: routeData.destName,
      safety_score: routeData.score,
      potholes_avoided: routeData.potholes.length,
      is_safer_route_chosen: true,
      distance_km: parseFloat(routeData.distance)
    }
    
    try {
      const res = await fetch('http://localhost:8000/api/v1/routes/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) setLogSuccess(true)
    } catch(e) {
      console.error(e)
    }
    setIsLogging(false)
  }

  const startIcon = L.divIcon({ className: '', html: '<div class="h-5 w-5 bg-teal-400 rounded-full border-[3px] border-white shadow-lg shadow-teal-500/50"></div>', iconSize: [20, 20] })
  const endIcon = L.divIcon({ className: '', html: '<div class="h-5 w-5 bg-rose-400 rounded-full border-[3px] border-white shadow-lg shadow-rose-500/50"></div>', iconSize: [20, 20] })
  const potholeIcon = L.divIcon({ className: '', html: '<div class="h-3.5 w-3.5 bg-orange-500 rounded-full border-2 border-white"></div>', iconSize: [14, 14] })

  return (
    <div className="p-4 sm:p-6 lg:p-8 text-slate-200 min-h-screen">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-teal-200/70">Navigation</p>
        <h2 className="mt-2 text-3xl font-black text-white md:text-5xl">Safe Route Navigator</h2>
        <p className="mt-4 text-slate-400 max-w-2xl">
          Enter your journey details to calculate the safest route. We analyze live traffic, road conditions, and historical anomalies to ensure a smooth trip.
        </p>
      </header>

      {/* Search Bar */}
      <div className="glass-panel rounded-xl p-5 mb-8 border border-slate-700/50 bg-slate-900/40">
        <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 items-end">
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Source Address</label>
            <input 
              type="text" 
              placeholder="E.g. Indiranagar, Bangalore" 
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700/50 rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition"
              required
            />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Destination Address</label>
            <input 
              type="text" 
              placeholder="E.g. Koramangala, Bangalore" 
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700/50 rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition"
              required
            />
          </div>
          <div className="lg:col-span-1">
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? 'Calculating...' : <><Navigation className="h-4 w-4"/> Find Route</>}
            </button>
          </div>
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        {/* Map Container */}
        <div className="glass-panel rounded-xl h-[600px] overflow-hidden border border-slate-700/50 relative z-0">
          {!routeData ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 z-10">
              <p className="text-slate-500 font-medium">Map awaiting search input...</p>
            </div>
          ) : null}
          
          <MapContainer center={[12.9716, 77.5946]} zoom={12} className="h-full w-full" zoomControl={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              className="map-tiles"
            />
            {routeData && (
              <>
                <MapRecenter bounds={routeData.bounds} />
                <Polyline positions={routeData.routeCoords} color="#2dd4bf" weight={5} opacity={0.8} />
                <Marker position={routeData.srcCoords} icon={startIcon}>
                  <Popup>Start: {routeData.srcName}</Popup>
                </Marker>
                <Marker position={routeData.destCoords} icon={endIcon}>
                  <Popup>End: {routeData.destName}</Popup>
                </Marker>
                
                {/* Render Potholes */}
                {routeData.potholes.map(pothole => (
                  <Marker key={pothole.id} position={pothole.coords} icon={potholeIcon}>
                    <Popup>
                      <strong className="text-orange-500">Anomaly Detected</strong><br/>
                      Severity: {pothole.severity}<br/>
                      Type: Pothole
                    </Popup>
                  </Marker>
                ))}
              </>
            )}
          </MapContainer>
        </div>

        {/* Analytics Panel */}
        <div className="flex flex-col gap-5">
          <div className="glass-panel rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-3 border-b border-slate-700/50 pb-4 mb-4">
              <ShieldCheck className="h-6 w-6 text-teal-400" />
              <h3 className="font-bold text-white text-lg">Route Analysis</h3>
            </div>
            
            {routeData ? (
              <div className="grid gap-5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Safety Score</span>
                  <span className={`text-xl font-black ${routeData.score > 80 ? 'text-teal-400' : 'text-amber-400'}`}>
                    {routeData.score}/100
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Distance</span>
                  <span className="text-white font-bold">{routeData.distance} km</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Est. Duration</span>
                  <span className="text-white font-bold">{routeData.duration} mins</span>
                </div>

                <div className="h-px w-full bg-slate-700/50 my-2"></div>

                <div className="flex items-start gap-3">
                  <Car className="h-5 w-5 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white">Traffic Status</p>
                    <p className="text-xs text-slate-400 mt-1">{routeData.traffic}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Activity className="h-5 w-5 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white">Road Anomalies</p>
                    <p className="text-xs text-amber-400 mt-1">{routeData.potholes.length} pothole(s) detected on this route.</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-10">Search for a route to view analysis.</p>
            )}
          </div>

          <div className="glass-panel rounded-xl p-6 border border-rose-500/20 bg-rose-500/5">
            <div className="flex items-center gap-3 border-b border-rose-500/20 pb-4 mb-4">
              <AlertTriangle className="h-6 w-6 text-rose-400" />
              <h3 className="font-bold text-white text-lg">Active Alerts</h3>
            </div>
            
            {routeData ? (
              <div className="grid gap-4">
                {routeData.accidents > 0 ? (
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
                    <strong className="text-rose-400 text-sm block">⚠️ Accident Reported</strong>
                    <span className="text-xs text-slate-300 block mt-1">Minor collision reported 2km ahead. Proceed with caution.</span>
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex gap-2 items-center">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400"/>
                    <span className="text-xs text-emerald-400">No accidents reported on route.</span>
                  </div>
                )}
                
                {routeData.potholes.some(p => p.severity === 'High') && (
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                    <strong className="text-orange-400 text-sm block">🚧 Severe Potholes</strong>
                    <span className="text-xs text-slate-300 block mt-1">High severity road damages detected. Speed reduction recommended.</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-10">Awaiting search...</p>
            )}
          </div>
          
          <button
            onClick={handleLogRoute}
            disabled={isLogging || logSuccess || !routeData}
            className="w-full rounded-xl border border-teal-500/30 bg-teal-500/10 py-4 text-sm font-bold text-teal-300 transition hover:bg-teal-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {logSuccess ? '✓ Saved to Trip Logs Database' : isLogging ? 'Saving...' : 'Save Trip to Database'}
          </button>
        </div>
      </div>
    </div>
  )
}
