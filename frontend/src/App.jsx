import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import SafeRoutes from './pages/SafeRoutes'
import DashboardLayout from './layouts/DashboardLayout'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/routes" element={<SafeRoutes />} />
          
          {/* Placeholders for future pages */}
          <Route path="/map" element={<div className="p-8 text-white">Live Map (Coming Soon)</div>} />
          <Route path="/events" element={<div className="p-8 text-white">Events (Coming Soon)</div>} />
          <Route path="/analytics" element={<div className="p-8 text-white">Analytics (Coming Soon)</div>} />
          <Route path="/predictions" element={<div className="p-8 text-white">Predictions (Coming Soon)</div>} />
          <Route path="/reports" element={<div className="p-8 text-white">Reports (Coming Soon)</div>} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
