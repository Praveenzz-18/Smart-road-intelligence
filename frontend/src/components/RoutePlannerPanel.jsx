import { LocateFixed, MapPin, Search } from 'lucide-react'
import { mockLocations } from '../services/mockRouteData'

function RoutePlannerPanel({
  source,
  destination,
  onSourceChange,
  onDestinationChange,
  onSearch,
  error,
}) {
  return (
    <form className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]" onSubmit={onSearch}>
      <label className="grid gap-2">
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
          <LocateFixed className="h-4 w-4 text-teal-300" />
          Source
        </span>
        <input
          className="h-12 rounded-lg border border-slate-700/70 bg-slate-950/70 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-teal-300/70 focus:ring-2 focus:ring-teal-300/15"
          list="safe-route-locations"
          onChange={(event) => onSourceChange(event.target.value)}
          placeholder="MG Road Junction"
          value={source}
        />
      </label>

      <label className="grid gap-2">
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
          <MapPin className="h-4 w-4 text-rose-300" />
          Destination
        </span>
        <input
          className="h-12 rounded-lg border border-slate-700/70 bg-slate-950/70 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-teal-300/70 focus:ring-2 focus:ring-teal-300/15"
          list="safe-route-locations"
          onChange={(event) => onDestinationChange(event.target.value)}
          placeholder="Indiranagar Metro"
          value={destination}
        />
      </label>

      <button
        className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-teal-300 px-5 text-sm font-black text-slate-950 transition hover:bg-teal-200"
        type="submit"
      >
        <Search className="h-4 w-4" />
        Search
      </button>

      <datalist id="safe-route-locations">
        {mockLocations.map((location) => (
          <option key={location.name} value={location.name} />
        ))}
      </datalist>

      {error ? (
        <p className="rounded-lg border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-200 lg:col-span-3">
          {error}
        </p>
      ) : null}
    </form>
  )
}

export default RoutePlannerPanel
