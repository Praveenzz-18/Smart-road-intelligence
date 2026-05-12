import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react'

function RouteAlertCard({ analysis }) {
  const isClear = analysis.alertLevel === 'clear'
  const Icon = isClear ? CheckCircle2 : analysis.alertLevel === 'severe' ? ShieldAlert : AlertTriangle

  const tone = isClear
    ? 'border-emerald-300/20 bg-emerald-400/10 text-emerald-200'
    : analysis.alertLevel === 'severe'
      ? 'border-rose-300/25 bg-rose-400/10 text-rose-200'
      : 'border-orange-300/25 bg-orange-400/10 text-orange-200'

  return (
    <div className={`rounded-lg border p-4 ${tone}`}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <strong className="block text-sm">
            {isClear
              ? 'No potholes detected on current route'
              : `${analysis.potholeCount} potholes detected on current route`}
          </strong>
          <span className="mt-2 block text-sm text-slate-400">
            {analysis.saferRouteRecommended
              ? 'Suggested safer alternative route available'
              : 'Current route remains within the mock safety threshold'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default RouteAlertCard
