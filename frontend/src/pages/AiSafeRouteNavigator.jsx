import { useCallback, useMemo, useState } from 'react'
import { Navigation, Route, ShieldCheck } from 'lucide-react'
import RouteAlertCard from '../components/RouteAlertCard'
import RoutePlannerPanel from '../components/RoutePlannerPanel'
import SafeRouteMap from '../components/SafeRouteMap'
import SafetyScorePanel from '../components/SafetyScorePanel'
import { dummyPotholes } from '../services/mockRouteData'
import {
  analyzeRoute,
  buildSaferWaypoint,
  resolveLocation,
} from '../services/routeSafetyService'

const defaultSource = 'MG Road Junction'
const defaultDestination = 'Indiranagar Metro'

function AiSafeRouteNavigator() {
  const [source, setSource] = useState(defaultSource)
  const [destination, setDestination] = useState(defaultDestination)
  const [sourceLocation, setSourceLocation] = useState(() => resolveLocation(defaultSource))
  const [destinationLocation, setDestinationLocation] = useState(() => resolveLocation(defaultDestination))
  const [routeCoordinates, setRouteCoordinates] = useState([])
  const [saferRouteCoordinates, setSaferRouteCoordinates] = useState([])
  const [error, setError] = useState('')

  const analysis = useMemo(
    () => analyzeRoute(routeCoordinates, dummyPotholes),
    [routeCoordinates],
  )
  const saferAnalysis = useMemo(
    () => analyzeRoute(saferRouteCoordinates, dummyPotholes),
    [saferRouteCoordinates],
  )
  const saferWaypoint = useMemo(() => {
    if (!sourceLocation || !destinationLocation) return null
    return buildSaferWaypoint(sourceLocation.coordinates, destinationLocation.coordinates)
  }, [destinationLocation, sourceLocation])

  const handleSearch = (event) => {
    event.preventDefault()

    const nextSource = resolveLocation(source)
    const nextDestination = resolveLocation(destination)

    if (!nextSource || !nextDestination) {
      setError('Choose one of the suggested Bengaluru locations, or enter coordinates as latitude, longitude.')
      return
    }

    setError('')
    setRouteCoordinates([])
    setSaferRouteCoordinates([])
    setSourceLocation(nextSource)
    setDestinationLocation(nextDestination)
  }

  const handlePrimaryRouteFound = useCallback((coordinates) => {
    setRouteCoordinates(coordinates)
  }, [])

  const handleSaferRouteFound = useCallback((coordinates) => {
    setSaferRouteCoordinates(coordinates)
  }, [])

  const showSaferRoute = analysis.saferRouteRecommended

  return (
    <section className="glass-panel mt-5 overflow-hidden rounded-lg" id="safe-routes">
      <div className="border-b border-slate-700/40 p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-200/70">
              AI Safe Route Navigator
            </p>
            <h3 className="mt-1 text-2xl font-black text-white">Pothole-aware route planning</h3>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs text-slate-400">
            <StatusPill icon={Navigation} label="OSM route" />
            <StatusPill icon={Route} label="Mock hazards" />
            <StatusPill icon={ShieldCheck} label="Safety score" />
          </div>
        </div>

        <div className="mt-5">
          <RoutePlannerPanel
            destination={destination}
            error={error}
            onDestinationChange={setDestination}
            onSearch={handleSearch}
            onSourceChange={setSource}
            source={source}
          />
        </div>
      </div>

      <div className="grid gap-5 p-5 2xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.6fr)]">
        <SafeRouteMap
          destinationLocation={destinationLocation}
          onPrimaryRouteFound={handlePrimaryRouteFound}
          onSaferRouteFound={handleSaferRouteFound}
          potholes={dummyPotholes}
          saferWaypoint={saferWaypoint}
          showSaferRoute={showSaferRoute}
          sourceLocation={sourceLocation}
        />

        <aside className="grid content-start gap-4">
          <RouteAlertCard analysis={analysis} />
          <SafetyScorePanel analysis={analysis} />

          {showSaferRoute ? (
            <div className="rounded-lg border border-yellow-300/20 bg-yellow-300/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-yellow-100/80">
                    Alternative Route
                  </p>
                  <strong className="mt-2 block text-lg text-white">
                    Safer path score: {saferAnalysis.roadHealthScore}/100
                  </strong>
                </div>
                <ShieldCheck className="h-7 w-7 text-yellow-200" />
              </div>
              <p className="mt-3 text-sm text-slate-400">
                The yellow route uses a mock detour waypoint to simulate avoiding dense pothole clusters.
              </p>
            </div>
          ) : null}

          <div className="rounded-lg border border-slate-700/40 bg-white/[0.04] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Detected Road Segments
            </p>
            <div className="mt-3 grid gap-2">
              {analysis.potholesNearRoute.length ? (
                analysis.potholesNearRoute.slice(0, 5).map((pothole) => (
                  <div className="flex items-center justify-between rounded-lg bg-slate-950/50 px-3 py-2" key={pothole.id}>
                    <span className="text-sm text-slate-300">{pothole.road}</span>
                    <span className={severityClass(pothole.severity)}>{pothole.severity}</span>
                  </div>
                ))
              ) : (
                <span className="rounded-lg bg-slate-950/50 px-3 py-2 text-sm text-slate-400">
                  No risky segments found near this route.
                </span>
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}

function StatusPill({ icon, label }) {
  const Icon = icon

  return (
    <span className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700/60 px-3 py-2">
      <Icon className="h-4 w-4 text-teal-300" />
      {label}
    </span>
  )
}

function severityClass(severity) {
  if (severity === 'severe') return 'text-xs font-bold uppercase text-rose-300'
  if (severity === 'medium') return 'text-xs font-bold uppercase text-orange-300'
  return 'text-xs font-bold uppercase text-yellow-200'
}

export default AiSafeRouteNavigator
