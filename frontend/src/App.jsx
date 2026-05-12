import L from 'leaflet'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Camera,
  Car,
  FileText,
  MapPin,
  Navigation,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import './App.css'
import AiSafeRouteNavigator from './pages/AiSafeRouteNavigator'

const roadEvents = [
  {
    id: 'EV-2481',
    type: 'crash',
    label: 'Crash',
    severity: 'High',
    confidence: 96,
    vehicle: 'VH-003',
    location: 'MG Road Junction',
    time: '10:42 AM',
    coordinates: [12.9756, 77.6052],
    image: 'Evidence queued',
  },
  {
    id: 'EV-2480',
    type: 'pothole',
    label: 'Pothole',
    severity: 'Medium',
    confidence: 91,
    vehicle: 'VH-001',
    location: 'Residency Road',
    time: '10:35 AM',
    coordinates: [12.9716, 77.5946],
    image: 'Image captured',
  },
  {
    id: 'EV-2479',
    type: 'speed-breaker',
    label: 'Speed Breaker',
    severity: 'Low',
    confidence: 87,
    vehicle: 'VH-002',
    location: 'Cubbon Park Gate',
    time: '10:21 AM',
    coordinates: [12.9763, 77.5929],
    image: 'No image',
  },
  {
    id: 'EV-2478',
    type: 'pothole',
    label: 'Pothole',
    severity: 'High',
    confidence: 94,
    vehicle: 'VH-004',
    location: 'Airport Road',
    time: '10:10 AM',
    coordinates: [12.9821, 77.6204],
    image: 'Image captured',
  },
  {
    id: 'EV-2477',
    type: 'pothole',
    label: 'Pothole',
    severity: 'Medium',
    confidence: 89,
    vehicle: 'VH-006',
    location: 'Richmond Circle',
    time: '09:58 AM',
    coordinates: [12.9667, 77.6017],
    image: 'Image captured',
  },
]

const metricCards = [
  { label: 'Events Today', value: '186', change: '+24%', icon: Activity, tone: 'text-teal-300' },
  { label: 'Critical Alerts', value: '09', change: '3 active', icon: Bell, tone: 'text-rose-300' },
  { label: 'Road Health', value: '72/100', change: 'city score', icon: ShieldCheck, tone: 'text-emerald-300' },
  { label: 'Repair Budget', value: 'Rs 4.2L', change: 'mock estimate', icon: Wrench, tone: 'text-amber-300' },
]

const trendData = [
  { day: 'Mon', potholes: 18, crashes: 2, speedBreakers: 8 },
  { day: 'Tue', potholes: 24, crashes: 1, speedBreakers: 10 },
  { day: 'Wed', potholes: 31, crashes: 3, speedBreakers: 9 },
  { day: 'Thu', potholes: 26, crashes: 2, speedBreakers: 14 },
  { day: 'Fri', potholes: 39, crashes: 4, speedBreakers: 12 },
  { day: 'Sat', potholes: 42, crashes: 2, speedBreakers: 16 },
  { day: 'Sun', potholes: 34, crashes: 1, speedBreakers: 11 },
]

const severityData = [
  { name: 'Low', value: 38, color: '#fde047' },
  { name: 'Medium', value: 44, color: '#fb923c' },
  { name: 'High', value: 18, color: '#fb7185' },
]

const roadScores = [
  { road: 'MG Road', score: 42, status: 'Critical', trend: '-8' },
  { road: 'Airport Road', score: 58, status: 'Poor', trend: '-5' },
  { road: 'Residency Road', score: 71, status: 'Watch', trend: '+2' },
  { road: 'Cubbon Loop', score: 84, status: 'Stable', trend: '+4' },
]

const predictions = [
  { segment: 'Airport Road S2', risk: 82, reason: 'Repeated vibration spikes after rainfall' },
  { segment: 'MG Road East', risk: 76, reason: 'High pothole density in a 300 m cluster' },
  { segment: 'Residency Road', risk: 61, reason: 'Medium events increasing week over week' },
]

const features = [
  ['Real-Time Detection', 'MVP'],
  ['Live Map', 'MVP'],
  ['Device Tracking', 'Next'],
  ['Crash Alerts', 'MVP'],
  ['Image Evidence', 'Next'],
  ['Analytics', 'MVP'],
  ['AI Verification', 'Planned'],
  ['Pothole Prediction', 'Planned'],
  ['Dimension Estimation', 'Planned'],
  ['Material Calculator', 'Mock'],
  ['Government Reports', 'Planned'],
  ['Budget Optimization', 'Planned'],
  ['Safe Routes', 'Mock'],
  ['Road Health Score', 'Mock'],
  ['Heatmap', 'Planned'],
]

const markerColors = {
  crash: '#fb7185',
  pothole: '#fb923c',
  'speed-breaker': '#fde047',
}

function markerIcon(type, label) {
  return L.divIcon({
    className: '',
    html: `<div class="road-marker marker-${type}">${label[0]}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  })
}

function severityColor(severity) {
  if (severity === 'High') return 'text-rose-300 bg-rose-400/10 border-rose-300/20'
  if (severity === 'Medium') return 'text-orange-300 bg-orange-400/10 border-orange-300/20'
  return 'text-yellow-200 bg-yellow-300/10 border-yellow-200/20'
}

function App() {
  return (
    <main className="min-h-screen text-slate-200">
      <div className="grid min-h-screen grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-slate-700/40 bg-slate-950/75 p-5 backdrop-blur-xl xl:sticky xl:top-0 xl:h-screen xl:border-b-0 xl:border-r">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-br from-teal-400 to-rose-400 font-black text-slate-950">
              SR
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200/70">Smart Road</p>
              <h1 className="text-xl font-black text-white">Intelligence</h1>
            </div>
          </div>

          <nav className="mt-8 grid gap-2 text-sm">
            {['Dashboard', 'Live Map', 'Safe Routes', 'Events', 'Analytics', 'Predictions', 'Reports'].map((item) => (
              <a
                className="rounded-lg border border-transparent px-3 py-3 text-slate-300 transition hover:border-slate-700 hover:bg-white/5 hover:text-white"
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                key={item}
              >
                {item}
              </a>
            ))}
          </nav>

          <section className="glass-panel mt-8 rounded-lg p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Device Stream</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-3xl font-black text-white">06</span>
              <Car className="h-7 w-7 text-teal-300" />
            </div>
            <p className="mt-3 text-sm text-slate-400">Mock ESP32 vehicles sending GPS, vibration, and image payloads.</p>
          </section>

          <section className="mt-5 rounded-lg border border-teal-300/20 bg-teal-300/10 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-teal-200">
              <span className="h-2 w-2 rounded-full bg-teal-300 shadow-[0_0_0_6px_rgba(45,212,191,0.12)]"></span>
              Live simulation
            </div>
            <p className="mt-2 text-xs text-slate-400">Hardware integration remains mocked for this software-first phase.</p>
          </section>
        </aside>

        <section className="p-4 sm:p-6 lg:p-8">
          <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between" id="dashboard">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-teal-200/70">Bengaluru smart-city command center</p>
              <h2 className="mt-2 max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl">
                AI-powered road intelligence and repair planning
              </h2>
            </div>
            <div className="glass-panel rounded-lg p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Network accuracy</p>
              <strong className="mt-1 block text-3xl text-white">93.4%</strong>
            </div>
          </header>

          <section className="mt-7 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
            {metricCards.map((metric) => {
              const Icon = metric.icon
              return (
                <article className="glass-panel rounded-lg p-5" key={metric.label}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-400">{metric.label}</p>
                      <strong className="mt-2 block text-3xl font-black text-white">{metric.value}</strong>
                    </div>
                    <Icon className={`h-7 w-7 ${metric.tone}`} />
                  </div>
                  <p className="mt-4 text-sm text-slate-500">{metric.change}</p>
                </article>
              )
            })}
          </section>

          <AiSafeRouteNavigator />

          <section className="mt-5 grid gap-5 2xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.75fr)]">
            <article className="glass-panel overflow-hidden rounded-lg" id="live-map">
              <div className="flex flex-col gap-3 border-b border-slate-700/40 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Live Map</p>
                  <h3 className="mt-1 text-xl font-black text-white">Road anomaly visualization</h3>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                  {Object.entries(markerColors).map(([type, color]) => (
                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 px-3 py-1" key={type}>
                      <i className="h-2.5 w-2.5 rounded-full" style={{ background: color }}></i>
                      {type.replace('-', ' ')}
                    </span>
                  ))}
                </div>
              </div>
              <div className="h-[430px]">
                <MapContainer center={[12.974, 77.603]} zoom={13} scrollWheelZoom={false}>
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {roadEvents.map((event) => (
                    <Marker
                      icon={markerIcon(event.type, event.label)}
                      key={event.id}
                      position={event.coordinates}
                    >
                      <Popup>
                        <strong>{event.label}</strong>
                        <br />
                        {event.location}
                        <br />
                        Confidence: {event.confidence}%
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </article>

            <article className="glass-panel rounded-lg p-5" id="alerts">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Emergency Desk</p>
                  <h3 className="mt-1 text-xl font-black text-white">Crash and risk alerts</h3>
                </div>
                <AlertTriangle className="h-7 w-7 text-rose-300" />
              </div>
              <div className="mt-5 grid gap-3">
                <AlertCard title="Crash near MG Road Junction" text="VH-003 detected high-impact vibration with 96% confidence." tone="rose" />
                <AlertCard title="Pothole cluster expanding" text="Airport Road shows repeated medium to high severity detections." tone="orange" />
              <AlertCard title="Image evidence ready" text="3 new camera captures are attached to mock inspection records." tone="sky" />
              </div>
            </article>
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
            <article className="glass-panel rounded-lg p-5" id="analytics">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Analytics</p>
                  <h3 className="mt-1 text-xl font-black text-white">Weekly anomaly trend</h3>
                </div>
                <BarChart3 className="h-7 w-7 text-teal-300" />
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="potholeGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#fb923c" stopOpacity={0.55} />
                        <stop offset="100%" stopColor="#fb923c" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                    <XAxis dataKey="day" stroke="#94a3b8" tickLine={false} />
                    <YAxis stroke="#94a3b8" tickLine={false} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.18)', borderRadius: 8 }} />
                    <Area dataKey="potholes" fill="url(#potholeGradient)" stroke="#fb923c" strokeWidth={3} type="monotone" />
                    <Area dataKey="speedBreakers" fill="transparent" stroke="#fde047" strokeWidth={2} type="monotone" />
                    <Area dataKey="crashes" fill="transparent" stroke="#fb7185" strokeWidth={2} type="monotone" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="glass-panel rounded-lg p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Severity</p>
                  <h3 className="mt-1 text-xl font-black text-white">Event distribution</h3>
                </div>
                <Sparkles className="h-7 w-7 text-amber-200" />
              </div>
              <div className="grid gap-4 md:grid-cols-[190px_1fr] xl:grid-cols-1 2xl:grid-cols-[190px_1fr]">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={severityData} dataKey="value" innerRadius={52} outerRadius={80} paddingAngle={4}>
                        {severityData.map((item) => (
                          <Cell fill={item.color} key={item.name} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.18)', borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid content-center gap-3">
                  {severityData.map((item) => (
                    <div className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2" key={item.name}>
                      <span className="flex items-center gap-2 text-sm text-slate-300">
                        <i className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }}></i>
                        {item.name}
                      </span>
                      <strong className="text-white">{item.value}%</strong>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          </section>

          <section className="mt-5 grid gap-5 2xl:grid-cols-[minmax(0,1.3fr)_minmax(360px,0.7fr)]">
            <article className="glass-panel rounded-lg p-5" id="events">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Events</p>
                  <h3 className="mt-1 text-xl font-black text-white">Latest detections</h3>
                </div>
                <Camera className="h-7 w-7 text-sky-300" />
              </div>
              <div className="thin-scrollbar overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.12em] text-slate-500">
                    <tr>
                      <th className="pb-3">Event</th>
                      <th className="pb-3">Location</th>
                      <th className="pb-3">Vehicle</th>
                      <th className="pb-3">Confidence</th>
                      <th className="pb-3">Image</th>
                      <th className="pb-3">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/40">
                    {roadEvents.map((event) => (
                      <tr key={event.id}>
                        <td className="py-3">
                          <span className={`rounded-full border px-3 py-1 text-xs font-bold ${severityColor(event.severity)}`}>
                            {event.label}
                          </span>
                        </td>
                        <td className="py-3 text-white">{event.location}</td>
                        <td className="py-3 text-slate-400">{event.vehicle}</td>
                        <td className="py-3 text-slate-300">{event.confidence}%</td>
                        <td className="py-3 text-slate-400">{event.image}</td>
                        <td className="py-3 text-slate-400">{event.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="glass-panel rounded-lg p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Road Health</p>
                  <h3 className="mt-1 text-xl font-black text-white">Segment scores</h3>
                </div>
                <MapPin className="h-7 w-7 text-teal-300" />
              </div>
              <div className="grid gap-4">
                {roadScores.map((road) => (
                  <div className="rounded-lg bg-white/[0.04] p-3" key={road.road}>
                    <div className="flex items-center justify-between">
                      <div>
                        <strong className="text-white">{road.road}</strong>
                        <p className="text-xs text-slate-500">{road.status}</p>
                      </div>
                      <span className="text-sm text-slate-400">{road.trend}</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                      <span
                        className="block h-full rounded-full bg-gradient-to-r from-rose-400 via-orange-300 to-teal-300"
                        style={{ width: `${road.score}%` }}
                      ></span>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-2" id="predictions">
            <article className="glass-panel rounded-lg p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Predictive Intelligence</p>
                  <h3 className="mt-1 text-xl font-black text-white">Future pothole risk</h3>
                </div>
                <Activity className="h-7 w-7 text-rose-300" />
              </div>
              <div className="grid gap-4">
                {predictions.map((item) => (
                  <div className="rounded-lg border border-slate-700/40 bg-white/[0.04] p-4" key={item.segment}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <strong className="text-white">{item.segment}</strong>
                        <p className="mt-1 text-sm text-slate-400">{item.reason}</p>
                      </div>
                      <b className="text-rose-300">{item.risk}%</b>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass-panel rounded-lg p-5" id="reports">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Planning</p>
                  <h3 className="mt-1 text-xl font-black text-white">Repair and reports</h3>
                </div>
                <FileText className="h-7 w-7 text-amber-200" />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <PlanningCard label="Damaged area" value="126 sq m" />
                <PlanningCard label="Asphalt needed" value="8.4 tons" />
                <PlanningCard label="Cost estimate" value="Rs 2.84L" />
              </div>
              <div className="mt-5 grid gap-3">
                <RouteCard title="Fastest route" value="18 min" icon={Navigation} />
                <RouteCard title="Safest route" value="91 score" icon={ShieldCheck} />
                <RouteCard title="Smoothest route" value="86 score" icon={Car} />
              </div>
            </article>
          </section>

          <section className="glass-panel mt-5 rounded-lg p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Complete Vision</p>
                <h3 className="mt-1 text-xl font-black text-white">Feature roadmap</h3>
              </div>
              <Sparkles className="h-7 w-7 text-teal-300" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
              {features.map(([name, status]) => (
                <div className="rounded-lg border border-slate-700/40 bg-white/[0.04] p-3" key={name}>
                  <strong className="block text-sm text-white">{name}</strong>
                  <span className="mt-2 inline-flex rounded-full border border-teal-300/20 bg-teal-300/10 px-2 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-teal-200">
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  )
}

function AlertCard({ title, text, tone }) {
  const tones = {
    rose: 'border-rose-300/25 bg-rose-400/10 text-rose-200',
    orange: 'border-orange-300/25 bg-orange-400/10 text-orange-200',
    sky: 'border-sky-300/25 bg-sky-400/10 text-sky-200',
  }

  return (
    <div className={`rounded-lg border p-4 ${tones[tone]}`}>
      <strong className="block text-sm">{title}</strong>
      <span className="mt-2 block text-sm text-slate-400">{text}</span>
    </div>
  )
}

function PlanningCard({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-700/40 bg-white/[0.04] p-4">
      <span className="text-sm text-slate-400">{label}</span>
      <strong className="mt-2 block text-2xl text-white">{value}</strong>
    </div>
  )
}

function RouteCard({ title, value, icon }) {
  const RouteIcon = icon

  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-700/40 bg-white/[0.04] p-3">
      <div className="flex items-center gap-3">
        <RouteIcon className="h-5 w-5 text-teal-300" />
        <strong className="text-white">{title}</strong>
      </div>
      <span className="text-sm text-slate-400">{value}</span>
    </div>
  )
}

export default App
