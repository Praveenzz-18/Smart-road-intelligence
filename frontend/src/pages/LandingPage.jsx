import { ArrowRight, Shield, Activity, Map, Cpu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function LandingPage() {
  const navigate = useNavigate()

  const handleSignIn = () => {
    // Dummy authentication, redirects to dashboard
    navigate('/dashboard')
  }

  return (
    <main 
      className="min-h-screen text-slate-200 relative"
      style={{
        backgroundImage: "url('/bg-road.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
    >
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-slate-950/75 z-0 pointer-events-none"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <nav className="flex items-center justify-between py-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Urban Guard Logo" className="h-10 w-10 rounded-lg object-cover" />
            <span className="text-xl font-black text-white">Urban Guard</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSignIn}
              className="text-sm font-bold text-slate-300 transition hover:text-white"
            >
              Sign In
            </button>
            <button
              onClick={handleSignIn}
              className="rounded-lg bg-teal-500/10 px-4 py-2 text-sm font-bold text-teal-300 transition hover:bg-teal-500/20"
            >
              Sign Up
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="mt-20 flex flex-col items-center text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-400/80">
            Next-Generation Infrastructure
          </p>
          <h1 className="mt-6 max-w-4xl text-5xl font-black leading-tight text-white md:text-7xl">
            AI-Powered Urban Guard System
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-400">
            Real-time pothole detection, crash alerts, and predictive maintenance using IoT devices and AI to build safer, smarter cities.
          </p>
          <div className="mt-10 flex gap-4">
            <button
              onClick={handleSignIn}
              className="flex items-center gap-2 rounded-lg bg-teal-400 px-6 py-3 font-bold text-slate-950 transition hover:bg-teal-300"
            >
              Go to Dashboard <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-32 pb-20">
          <h2 className="text-center text-3xl font-black text-white">Core Features</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={Activity}
              title="Real-Time Detection"
              description="Identify potholes, crashes, and speed breakers instantly using live IoT data."
            />
            <FeatureCard
              icon={Map}
              title="Live Mapping"
              description="Visualize road anomalies on a dynamic map with accurate location tracking."
            />
            <FeatureCard
              icon={Shield}
              title="Predictive Maintenance"
              description="AI-driven road health scoring and repair cost estimation for city planners."
            />
            <FeatureCard
              icon={Cpu}
              title="IoT Integration"
              description="Hardware edge-devices sending vibration, GPS, and image telemetry."
            />
          </div>
        </div>
      </div>
    </main>
  )
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-white/[0.02] p-6 backdrop-blur-sm transition hover:bg-white/[0.04]">
      <div className="inline-flex rounded-lg bg-teal-400/10 p-3">
        <Icon className="h-6 w-6 text-teal-300" />
      </div>
      <h3 className="mt-4 text-xl font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
    </div>
  )
}

export default LandingPage
