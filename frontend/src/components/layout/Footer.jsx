import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-[#0d1b2e] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">M</span>
              </div>
              <span className="font-black text-white text-lg tracking-tight">MedsNear</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Connecting Nigerians to the medication they need. Real-time pharmacy inventory, powered by field agents.
            </p>
            <p className="text-white/40 text-xs mt-4 font-label">Lagos, Nigeria</p>
          </div>

          {/* Platform */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/40 font-label mb-4">Platform</p>
            <ul className="space-y-2.5">
              <li><Link to="/how-it-works" className="text-sm text-white/70 hover:text-white transition-colors">How it works</Link></li>
              <li><Link to="/agents" className="text-sm text-white/70 hover:text-white transition-colors">For agents</Link></li>
              <li><a href="https://wa.me/2348157537642" target="_blank" rel="noreferrer" className="text-sm text-white/70 hover:text-white transition-colors">Search drugs</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/40 font-label mb-4">Company</p>
            <ul className="space-y-2.5">
              <li><Link to="/about" className="text-sm text-white/70 hover:text-white transition-colors">About us</Link></li>
              <li><Link to="/contact" className="text-sm text-white/70 hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="text-sm text-white/70 hover:text-white transition-colors">Privacy policy</Link></li>
              <li><Link to="/terms" className="text-sm text-white/70 hover:text-white transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-white/40 text-xs font-label">© 2025 MedsNear. Made with care in Nigeria.</p>
          <a href="https://wa.me/2348157537642" target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary hover:text-primary-light transition-colors font-label">
            Search on WhatsApp →
          </a>
        </div>
      </div>
    </footer>
  )
}
