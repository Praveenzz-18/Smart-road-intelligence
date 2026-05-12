import L from 'leaflet'
import { Layers, MapPinned } from 'lucide-react'
import { useMemo } from 'react'
import { CircleMarker, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import RoutingMachineControl from './RoutingMachineControl'

const severityStyles = {
  severe: { color: '#ef4444', label: 'Severe' },
  medium: { color: '#fb923c', label: 'Medium' },
  low: { color: '#fde047', label: 'Low' },
}

const endpointIcon = (type) =>
  L.divIcon({
    className: '',
    html: `<div class="route-endpoint route-endpoint-${type}">${type === 'source' ? 'S' : 'D'}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  })

function SafeRouteMap({
  sourceLocation,
  destinationLocation,
  saferWaypoint,
  potholes,
  showSaferRoute,
  onPrimaryRouteFound,
  onSaferRouteFound,
}) {
  const center = sourceLocation?.coordinates ?? [12.974, 77.603]
  const primaryWaypoints = useMemo(
    () => sourceLocation && destinationLocation
      ? [sourceLocation.coordinates, destinationLocation.coordinates]
      : [],
    [destinationLocation, sourceLocation],
  )
  const saferWaypoints = useMemo(
    () => sourceLocation && destinationLocation && saferWaypoint
      ? [sourceLocation.coordinates, saferWaypoint, destinationLocation.coordinates]
      : [],
    [destinationLocation, saferWaypoint, sourceLocation],
  )

  return (
    <div className="relative h-[520px] overflow-hidden rounded-lg border border-slate-700/40">
      <MapContainer center={center} scrollWheelZoom zoom={13}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {sourceLocation ? (
          <Marker icon={endpointIcon('source')} position={sourceLocation.coordinates}>
            <Popup>Source: {sourceLocation.name}</Popup>
          </Marker>
        ) : null}

        {destinationLocation ? (
          <Marker icon={endpointIcon('destination')} position={destinationLocation.coordinates}>
            <Popup>Destination: {destinationLocation.name}</Popup>
          </Marker>
        ) : null}

        {potholes.map((pothole) => {
          const style = severityStyles[pothole.severity]

          return (
            <CircleMarker
              center={[pothole.latitude, pothole.longitude]}
              fillColor={style.color}
              fillOpacity={0.9}
              key={pothole.id}
              pathOptions={{ color: '#0f172a', weight: 2 }}
              radius={pothole.severity === 'severe' ? 9 : pothole.severity === 'medium' ? 7 : 6}
            >
              <Popup>
                <strong>{style.label} pothole</strong>
                <br />
                {pothole.road}
              </Popup>
            </CircleMarker>
          )
        })}

        <RoutingMachineControl
          color="#2dd4bf"
          onRouteFound={onPrimaryRouteFound}
          visible={primaryWaypoints.length > 0}
          waypoints={primaryWaypoints}
        />
        <RoutingMachineControl
          color="#facc15"
          onRouteFound={onSaferRouteFound}
          visible={showSaferRoute && saferWaypoints.length > 0}
          waypoints={saferWaypoints}
        />
      </MapContainer>

      <div className="pointer-events-none absolute left-4 top-4 z-[500] rounded-lg border border-slate-700/50 bg-slate-950/85 p-3 shadow-2xl backdrop-blur">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
          <MapPinned className="h-4 w-4 text-teal-300" />
          Route Layers
        </div>
        <div className="mt-3 grid gap-2 text-xs text-slate-300">
          <LegendDot color="#2dd4bf" label="Primary route" />
          <LegendDot color="#facc15" label="Safer route" />
          <LegendDot color="#ef4444" label="Severe pothole" />
          <LegendDot color="#fb923c" label="Medium pothole" />
          <LegendDot color="#fde047" label="Low pothole" />
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-4 right-4 z-[500] rounded-lg border border-teal-300/20 bg-teal-300/10 px-3 py-2 text-xs font-bold text-teal-100 backdrop-blur">
        <span className="inline-flex items-center gap-2">
          <Layers className="h-4 w-4" />
          Mock pothole intelligence
        </span>
      </div>
    </div>
  )
}

function LegendDot({ color, label }) {
  return (
    <span className="inline-flex items-center gap-2">
      <i className="h-2.5 w-2.5 rounded-full" style={{ background: color }}></i>
      {label}
    </span>
  )
}

export default SafeRouteMap
