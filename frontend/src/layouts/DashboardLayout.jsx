import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

export default function DashboardLayout() {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-slate-950 xl:grid-cols-[280px_minmax(0,1fr)]">
      <Sidebar />
      <div className="max-h-screen overflow-y-auto">
        <Outlet />
      </div>
    </div>
  )
}
