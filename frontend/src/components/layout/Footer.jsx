import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-surface-container-highest text-on-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col gap-2 items-center md:items-start">
          <div className="font-headline-md text-headline-md font-bold text-primary">MedsNear</div>
          <p className="font-body-md text-body-md text-on-surface-variant text-center md:text-left">© 2026 MedsNear. Reliable healthcare logistics.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-6 font-body-md text-body-md text-on-secondary-container">
          <a href="#" className="hover:text-on-surface transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-on-surface transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-on-surface transition-colors">Contact Us</a>
        </div>
      </div>
    </footer>
  )
}
