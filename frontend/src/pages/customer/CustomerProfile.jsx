import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function CustomerProfile() {
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()

  const [name, setName]       = useState(user?.name || '')
  const [phone, setPhone]     = useState(user?.phone || '')
  const [address, setAddress] = useState(user?.address || '')
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState('')

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      // Persist updated name/phone/address into auth context + localStorage
      const updated = { ...user, name: name.trim(), phone: phone.trim(), address: address.trim() }
      login(localStorage.getItem('mn_token'), updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setError('Unable to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = () => {
    logout()
    navigate('/signin')
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Page header */}
      <div className="bg-surface border-b border-outline/30 py-4 px-4 md:px-8 sticky top-16 z-30">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-on-surface-variant">Account › Profile</p>
            <h1 className="text-2xl font-black text-on-surface mt-0.5">My Profile</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back
          </button>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 md:px-8 py-10 space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center text-2xl font-black text-on-primary-container">
            {user?.name?.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase() || 'ME'}
          </div>
          <div>
            <p className="font-bold text-on-surface text-lg">{user?.name || 'Customer'}</p>
            <p className="text-sm text-on-surface-variant">{user?.email || 'No email on file'}</p>
          </div>
        </div>

        {/* Edit form */}
        <div className="bg-white rounded-2xl border border-outline/40 p-6 shadow-sm">
          <h2 className="font-bold text-on-surface mb-5">Personal Information</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4">{error}</div>
          )}
          {saved && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 mb-4">
              Profile updated successfully.
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="profile-name" className="block text-sm font-semibold text-on-surface mb-1.5">Full Name</label>
              <input
                id="profile-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-outline rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none transition-all"
              />
            </div>
            <div>
              <label htmlFor="profile-phone" className="block text-sm font-semibold text-on-surface mb-1.5">Phone Number</label>
              <div className="flex">
                <span className="inline-flex items-center px-4 border border-r-0 border-outline rounded-l-xl text-sm text-on-surface-variant bg-surface-low">
                  +234
                </span>
                <input
                  id="profile-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="8012345678"
                  className="flex-1 border border-outline rounded-r-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none transition-all"
                />
              </div>
              <p className="text-xs text-on-surface-variant mt-1">Used to look up your order history.</p>
            </div>
            <div>
              <label htmlFor="profile-address" className="block text-sm font-semibold text-on-surface mb-1.5">Default Delivery Address</label>
              <textarea
                id="profile-address"
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House number, street, area, LGA"
                className="w-full border border-outline rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none transition-all resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full h-12 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-2xl border border-outline/40 p-6 shadow-sm space-y-3">
          <h2 className="font-bold text-on-surface mb-1">Quick Links</h2>
          <button
            type="button"
            onClick={() => navigate('/customer/orders')}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-surface-low transition-colors text-sm font-medium text-on-surface"
          >
            <span className="material-symbols-outlined text-primary">receipt_long</span>
            My Order History
          </button>
          <button
            type="button"
            onClick={() => navigate('/track-order')}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-surface-low transition-colors text-sm font-medium text-on-surface"
          >
            <span className="material-symbols-outlined text-primary">local_shipping</span>
            Track a Delivery
          </button>
          <button
            type="button"
            onClick={() => navigate('/customer/search')}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-surface-low transition-colors text-sm font-medium text-on-surface"
          >
            <span className="material-symbols-outlined text-primary">search</span>
            Search Medications
          </button>
        </div>

        {/* Sign out */}
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full py-3 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors"
        >
          Sign Out
        </button>
      </main>
    </div>
  )
}
