import { Gauge, ShieldCheck, Siren } from 'lucide-react'

function SafetyScorePanel({ analysis }) {
  const scoreColor =
    analysis.roadHealthScore >= 75
      ? 'text-emerald-300'
      : analysis.roadHealthScore >= 50
        ? 'text-orange-300'
        : 'text-rose-300'

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <MetricTile
        icon={Gauge}
        label="Road Health Score"
        value={`${analysis.roadHealthScore}/100`}
        valueClassName={scoreColor}
      />
      <MetricTile
        icon={Siren}
        label="Potholes Near Route"
        value={analysis.potholeCount}
        valueClassName="text-orange-300"
      />
      <MetricTile
        icon={ShieldCheck}
        label="Safer Route Recommended"
        value={analysis.saferRouteRecommended ? 'Yes' : 'No'}
        valueClassName={analysis.saferRouteRecommended ? 'text-rose-300' : 'text-emerald-300'}
      />
    </div>
  )
}

function MetricTile({ icon, label, value, valueClassName }) {
  const Icon = icon

  return (
    <div className="rounded-lg border border-slate-700/40 bg-white/[0.04] p-4">
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm text-slate-400">{label}</span>
        <Icon className="h-5 w-5 text-teal-300" />
      </div>
      <strong className={`mt-3 block text-2xl font-black ${valueClassName}`}>{value}</strong>
    </div>
  )
}

export default SafetyScorePanel
