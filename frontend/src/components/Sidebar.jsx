import { Car } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { name: 'Safe Routes', path: '/routes' },
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Live Map', path: '/map' },
  { name: 'Events', path: '/events' },
  { name: 'Analytics', path: '/analytics' },
  { name: 'Predictions', path: '/predictions' },
  { name: 'Reports', path: '/reports' },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="border-b border-slate-700/40 bg-slate-950/75 p-5 backdrop-blur-xl xl:sticky xl:top-0 xl:h-screen xl:border-b-0 xl:border-r text-slate-200">
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="Urban Guard Logo" className="h-12 w-12 rounded-lg object-cover" />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200/70">Urban</p>
          <h1 className="text-xl font-black text-white">Guard</h1>
        </div>
      </div>

      <nav className="mt-8 grid gap-2 text-sm">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              to={item.path}
              key={item.name}
              className={`rounded-lg border px-3 py-3 transition ${
                isActive
                  ? 'border-slate-700 bg-white/5 text-white font-bold'
                  : 'border-transparent text-slate-300 hover:border-slate-700 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          )
        })}
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
  )
}
