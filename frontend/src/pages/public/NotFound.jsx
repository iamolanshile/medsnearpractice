import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="text-center">
        <p className="text-8xl font-black text-primary/20 mb-4">404</p>
        <h1 className="text-2xl font-black text-on-surface mb-2">Page not found</h1>
        <p className="text-on-surface-variant mb-6">This page doesn't exist or was moved.</p>
        <Link to="/" className="btn-primary text-sm">Go home</Link>
      </div>
    </div>
  )
}
