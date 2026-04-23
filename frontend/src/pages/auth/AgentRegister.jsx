import { Link } from 'react-router-dom'

// Redirect to the agents page apply section
export default function AgentRegister() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="text-center">
        <p className="text-4xl mb-4">👋</p>
        <h1 className="text-2xl font-black text-on-surface mb-2">Want to become an agent?</h1>
        <p className="text-on-surface-variant mb-6">Fill out the application form on our agents page.</p>
        <Link to="/agents#apply" className="btn-primary text-sm">Apply now →</Link>
      </div>
    </div>
  )
}
