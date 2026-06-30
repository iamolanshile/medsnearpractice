import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

function VerificationBadge({ status }) {
  const map = {
    verified:   { label: 'Verified',   cls: 'bg-green-100 text-green-700',  icon: 'verified' },
    pending:    { label: 'Pending',    cls: 'bg-amber-100 text-amber-700',  icon: 'hourglass_top' },
    suspended:  { label: 'Flagged',   cls: 'bg-red-100 text-red-700',     icon: 'flag' },
  }
  const { label, cls, icon } = map[status] || { label: 'Unverified', cls: 'bg-surface-high text-on-surface-variant', icon: 'help' }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${cls}`}>
      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      {label}
    </span>
  )
}

export default function AgentProfile() {
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()

  const [name, setName]       = useState(user?.name  || '')
  const [email, setEmail]     = useState(user?.email || '')
  const [phone, setPhone]     = useState(user?.phone || '')
  const [region, setRegion]   = useState(user?.region || '')

  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState('')

  const [pwForm, setPwForm]   = useState({ current: '', next: '', confirm: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg]     = useState(null)

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await api.patch('/agent/profile', { name: name.trim(), phone: phone.trim(), region: region.trim() })
      const updated = { ...user, name: name.trim(), phone: phone.trim(), region: region.trim() }
      login(localStorage.getItem('mn_token'), updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err.error || 'Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  const handlePassword = async (e) => {
    e.preventDefault()
    if (pwForm.next !== pwForm.confirm) {
      setPwMsg({ type: 'error', text: 'New passwords do not match.' })
      return
    }
    if (pwForm.next.length < 8) {
      setPwMsg({ type: 'error', text: 'Password must be at least 8 characters.' })
      return
    }
    setPwSaving(true)
    setPwMsg(null)
    try {
      await api.patch('/agent/password', { current_password: pwForm.current, new_password: pwForm.next })
      setPwMsg({ type: 'success', text: 'Password updated successfully.' })
      setPwForm({ current: '', next: '', confirm: '' })
    } catch (err) {
      setPwMsg({ type: 'error', text: err.error || 'Failed to update password.' })
    } finally {
      setPwSaving(false)
    }
  }

  const handleLogout = () => { logout(); navigate('/agent/login') }

  return (
    <div className="max-w-lg mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">My Profile</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">Manage your account information.</p>
      </div>

      {/* Identity card */}
      <div className="bg-white rounded-xl border border-outline/40 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-primary font-black text-2xl">
              {user?.name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'AG'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-on-surface text-lg truncate">{user?.name}</p>
            <p className="text-sm text-on-surface-variant truncate">{user?.email}</p>
            <div className="mt-1.5">
              <VerificationBadge status={user?.verification_status} />
            </div>
          </div>
        </div>

        {/* Read-only info row */}
        <div className="mt-5 pt-4 border-t border-outline/10 grid grid-cols-2 gap-3">
          {[
            { label: 'State',  value: user?.state || '—' },
            { label: 'LGA',    value: user?.lga   || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface-low rounded-lg px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{label}</p>
              <p className="text-sm font-semibold text-on-surface mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-xl border border-outline/40 p-6">
        <h2 className="font-bold text-on-surface mb-4">Edit Details</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>{error}
          </div>
        )}
        {saved && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>Profile updated.
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" value={email} disabled className="input-field opacity-50 cursor-not-allowed" />
            <p className="text-xs text-on-surface-variant mt-1">Contact support to change your email.</p>
          </div>
          <div>
            <label className="label">Phone</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 border border-r-0 border-outline rounded-l-xl text-sm text-on-surface-variant bg-surface-low">+234</span>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="8012345678"
                className="flex-1 border border-outline rounded-r-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none transition-all" />
            </div>
          </div>
          <div>
            <label className="label">Region / Coverage Area</label>
            <input type="text" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="e.g. Lekki, Lagos"
              className="input-field" />
          </div>
          <button type="submit" disabled={saving}
            className="btn-primary w-full justify-center py-3 disabled:opacity-60">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-xl border border-outline/40 p-6">
        <h2 className="font-bold text-on-surface mb-4">Change Password</h2>

        {pwMsg && (
          <div className={`rounded-xl px-4 py-3 text-sm mb-4 flex items-center gap-2 ${pwMsg.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            <span className="material-symbols-outlined text-[16px]">
              {pwMsg.type === 'success' ? 'check_circle' : 'error'}
            </span>
            {pwMsg.text}
          </div>
        )}

        <form onSubmit={handlePassword} className="space-y-4">
          {[
            { key: 'current', label: 'Current password', placeholder: '••••••••' },
            { key: 'next',    label: 'New password',     placeholder: 'Min. 8 characters' },
            { key: 'confirm', label: 'Confirm new password', placeholder: 'Repeat new password' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input type="password" required value={pwForm[key]} placeholder={placeholder}
                onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })}
                className="input-field" />
            </div>
          ))}
          <button type="submit" disabled={pwSaving}
            className="w-full py-3 border border-outline/40 rounded-xl text-sm font-semibold text-on-surface hover:bg-surface-low transition-colors disabled:opacity-60">
            {pwSaving ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Sign out */}
      <button onClick={handleLogout}
        className="w-full py-3 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
        <span className="material-symbols-outlined text-[18px]">logout</span>
        Log Out
      </button>
    </div>
  )
}
