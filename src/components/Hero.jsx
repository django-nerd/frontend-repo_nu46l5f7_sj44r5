import Spline from '@splinetool/react-spline'

export default function Hero() {
  return (
    <section className="relative h-[65vh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/LU2mWMPbF3Qi1Qxh/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex items-center">
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 md:p-8 text-white max-w-2xl pointer-events-none">
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-3">Overlay management for Twitch, built to scale</h1>
          <p className="text-white/80 text-sm md:text-base">Design drag-and-drop overlays in your browser. Publish to a private URL for OBS. Alerts, timers, goals, and minigames included.</p>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 pointer-events-none" />
    </section>
  )
}
