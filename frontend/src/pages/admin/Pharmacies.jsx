import { useEffect, useMemo, useState } from 'react'
import api from '../../services/api'

const INITIAL_FORM = {
  name: '',
  address: '',
  lga: '',
  state: '',
  phone: '',
}

export default function AdminPharmacies() {
  const [pharmacies, setPharmacies] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPharmacy, setEditingPharmacy] = useState(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [formError, setFormError] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [message, setMessage] = useState('')

  const fetchPharmacies = async () => {
    setLoading(true)
    try {
      const data = await api.get('/admin/pharmacies')
      setPharmacies(data || [])
    } catch (error) {
      console.error('Failed to load pharmacies', error)
      setMessage('Unable to fetch pharmacies. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPharmacies()
  }, [])

  const enrichedPharmacies = useMemo(() => {
    return pharmacies.map((pharmacy) => ({
      ...pharmacy,
      status: pharmacy.status || (pharmacy.added_by ? 'active' : 'inactive'),
      contactName: pharmacy.added_by ? 'Partner agent' : 'Unknown',
      contactPhone: pharmacy.phone || '—',
      statusLabel: pharmacy.status === 'inactive' ? 'Inactive' : 'Active',
      statusBadge: pharmacy.status === 'inactive' ? 'badge-red' : 'badge-green',
    }))
  }, [pharmacies])

  const filteredPharmacies = useMemo(() => {
    return enrichedPharmacies.filter((pharmacy) => {
      if (statusFilter !== 'all' && pharmacy.status !== statusFilter) return false
      const query = search.trim().toLowerCase()
      if (!query) return true
      return [pharmacy.name, pharmacy.address, pharmacy.lga, pharmacy.state, pharmacy.phone, pharmacy.contactName]
        .some((value) => value?.toLowerCase?.().includes(query))
    })
  }, [enrichedPharmacies, search, statusFilter])

  const total = pharmacies.length
  const activeCount = enrichedPharmacies.filter((pharmacy) => pharmacy.status === 'active').length
  const inactiveCount = enrichedPharmacies.filter((pharmacy) => pharmacy.status === 'inactive').length
  const statesCount = new Set(pharmacies.map((p) => p.state).filter(Boolean)).size

  const openAddModal = () => {
    setEditingPharmacy(null)
    setForm(INITIAL_FORM)
    setFormError('')
    setMessage('')
    setModalOpen(true)
  }

  const openEditModal = (pharmacy) => {
    setEditingPharmacy(pharmacy)
    setForm({
      name: pharmacy.name || '',
      address: pharmacy.address || '',
      lga: pharmacy.lga || '',
      state: pharmacy.state || '',
      phone: pharmacy.phone || '',
    })
    setFormError('')
    setMessage('')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingPharmacy(null)
    setForm(INITIAL_FORM)
    setFormError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    if (!form.name.trim() || !form.address.trim()) {
      setFormError('Name and address are required.')
      return
    }

    setSubmitLoading(true)
    try {
      if (editingPharmacy) {
        await api.patch(`/admin/pharmacies/${editingPharmacy._id}`, form)
        setMessage('Pharmacy updated successfully.')
      } else {
        await api.post('/admin/pharmacies', form)
        setMessage('New pharmacy added successfully.')
      }
      await fetchPharmacies()
      closeModal()
    } catch (error) {
      console.error('Pharmacy save failed', error)
      setFormError(error?.error || error?.message || 'Save failed. Please try again.')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDeactivate = async (pharmacy) => {
    if (!window.confirm(`Deactivate pharmacy ${pharmacy.name}?`)) return
    try {
      await api.patch(`/admin/pharmacies/${pharmacy._id}`, { status: pharmacy.status === 'inactive' ? 'active' : 'inactive' })
      setMessage(`${pharmacy.status === 'inactive' ? 'Reactivated' : 'Deactivated'} ${pharmacy.name}.`)
      await fetchPharmacies()
    } catch (error) {
      console.error('Failed to update status', error)
      setMessage('Unable to update pharmacy status.')
    }
  }

  const handleDelete = async (pharmacy) => {
    if (!window.confirm(`Delete pharmacy ${pharmacy.name}? This cannot be undone.`)) return
    try {
      await api.delete(`/admin/pharmacies/${pharmacy._id}`)
      setMessage(`Deleted ${pharmacy.name}.`)
      await fetchPharmacies()
    } catch (error) {
      console.error('Failed to delete pharmacy', error)
      setMessage('Unable to delete pharmacy.')
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">Pharmacy Directory</h1>
          <p className="text-sm text-on-surface-variant mt-1">Manage and monitor active and inactive pharmacy partners across the network.</p>
        </div>
        <button onClick={openAddModal} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-container transition-all">
          <span className="material-symbols-outlined text-[20px]">add</span>
          Add New Pharmacy
        </button>
      </div>

      {message && <div className="rounded-3xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">{message}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="rounded-3xl border border-outline/40 bg-white p-6 shadow-sm">
          <div className="flex justify-between items-start gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant mb-2">Total Pharmacies</p>
              <p className="text-3xl font-black text-on-surface">{total}</p>
            </div>
            <span className="rounded-2xl bg-primary/10 p-3 text-primary">
              <span className="material-symbols-outlined">storefront</span>
            </span>
          </div>
          <p className="text-sm text-on-surface-variant mt-3">{activeCount} active, {inactiveCount} inactive</p>
        </div>

        <div className="rounded-3xl border border-outline/40 bg-white p-6 shadow-sm">
          <div className="flex justify-between items-start gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant mb-2">Active Pharmacies</p>
              <p className="text-3xl font-black text-on-surface">{activeCount}</p>
            </div>
            <span className="rounded-2xl bg-primary/10 p-3 text-primary">
              <span className="material-symbols-outlined">check_circle</span>
            </span>
          </div>
          <p className="text-sm text-on-surface-variant mt-3">Pharmacies currently enabled for inventory tracking.</p>
        </div>

        <div className="rounded-3xl border border-outline/40 bg-white p-6 shadow-sm">
          <div className="flex justify-between items-start gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant mb-2">Inactive Pharmacies</p>
              <p className="text-3xl font-black text-on-surface">{inactiveCount}</p>
            </div>
            <span className="rounded-2xl bg-error-container/20 p-3 text-error">
              <span className="material-symbols-outlined">block</span>
            </span>
          </div>
          <p className="text-sm text-on-surface-variant mt-3">Pharmacies deactivated from network operations.</p>
        </div>

        <div className="rounded-3xl border border-outline/40 bg-white p-6 shadow-sm">
          <div className="flex justify-between items-start gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant mb-2">Active States</p>
              <p className="text-3xl font-black text-on-surface">{statesCount}</p>
            </div>
            <span className="rounded-2xl bg-surface-high p-3 text-on-surface">
              <span className="material-symbols-outlined">map</span>
            </span>
          </div>
          <p className="text-sm text-on-surface-variant mt-3">States covered by the current network.</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-outline/40 bg-surface-low shadow-sm">
        <div className="px-6 py-5 border-b border-outline/20 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-on-surface-variant">Inventory Grid</p>
            <h2 className="text-xl font-black text-on-surface">Live pharmacy inventory</h2>
            <p className="text-sm text-on-surface-variant">Track active and inactive pharmacy partners in one place.</p>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <label className="relative block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search pharmacy or location..."
                className="w-full min-w-[220px] rounded-full border border-outline/30 bg-white py-3 pl-11 pr-4 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </label>
            <button className="inline-flex items-center gap-2 rounded-lg bg-primary text-white px-4 py-3 text-sm font-semibold hover:bg-primary-dark transition-all">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export report
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-outline-variant">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Pharmacy</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Contact</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Location</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">State</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant text-center">Status</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                [...Array(5)].map((_, index) => (
                  <tr key={index} className="animate-pulse bg-white">
                    <td className="px-6 py-5 h-14" />
                    <td className="px-6 py-5 h-14" />
                    <td className="px-6 py-5 h-14" />
                    <td className="px-6 py-5 h-14" />
                    <td className="px-6 py-5 h-14" />
                    <td className="px-6 py-5 h-14" />
                  </tr>
                ))
              ) : filteredPharmacies.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-on-surface-variant">No matching pharmacies found.</td>
                </tr>
              ) : (
                filteredPharmacies.map((pharmacy) => (
                  <tr key={pharmacy._id} className="table-row-hover transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary text-lg font-bold">
                          {pharmacy.name?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <p className="font-semibold text-on-surface">{pharmacy.name}</p>
                          <p className="text-[12px] text-on-surface-variant mt-1">{pharmacy.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface">
                      <p className="font-medium">{pharmacy.contactName}</p>
                      <p className="text-xs text-on-surface-variant mt-1">{pharmacy.contactPhone}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{pharmacy.lga || '—'}</td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{pharmacy.state || '—'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] ${pharmacy.status === 'inactive' ? 'bg-error-container text-error' : 'bg-primary/10 text-primary'}`}>
                        {pharmacy.statusLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <button onClick={() => openEditModal(pharmacy)} className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-high transition-colors" title="Edit">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button onClick={() => handleDeactivate(pharmacy)} className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-high transition-colors" title={pharmacy.status === 'inactive' ? 'Activate' : 'Deactivate'}>
                          <span className="material-symbols-outlined text-[20px]">{pharmacy.status === 'inactive' ? 'check_circle' : 'block'}</span>
                        </button>
                        <button onClick={() => handleDelete(pharmacy)} className="p-2 rounded-lg text-error hover:bg-error-container/20 hover:text-error transition-colors" title="Delete">
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-surface-low border-t border-outline/20 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-on-surface-variant">Showing {filteredPharmacies.length} of {total} pharmacies</p>
          <button onClick={() => setSearch('')} className="rounded-full border border-outline/40 bg-white px-4 py-2 text-sm font-semibold text-on-surface hover:bg-surface-low transition-all">
            Reset search
          </button>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
          <div className="w-full max-w-3xl rounded-[2rem] bg-white p-6 shadow-2xl ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-on-surface">{editingPharmacy ? 'Edit Pharmacy' : 'Add New Pharmacy'}</h2>
                <p className="text-sm text-on-surface-variant mt-1">{editingPharmacy ? 'Update pharmacy details.' : 'Create a new pharmacy entry for network management.'}</p>
              </div>
              <button onClick={closeModal} className="rounded-full border border-outline px-3 py-2 text-on-surface-variant hover:bg-surface-low transition-colors">
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-on-surface-variant">
                Pharmacy name
                <input
                  className="w-full rounded-3xl border border-outline px-4 py-3 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="PharmaCare Lagos Island"
                />
              </label>
              <label className="space-y-2 text-sm text-on-surface-variant">
                Phone number
                <input
                  className="w-full rounded-3xl border border-outline px-4 py-3 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  placeholder="+234 802 345 6789"
                />
              </label>
              <label className="space-y-2 text-sm text-on-surface-variant md:col-span-2">
                Address
                <input
                  className="w-full rounded-3xl border border-outline px-4 py-3 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                  value={form.address}
                  onChange={(event) => setForm({ ...form, address: event.target.value })}
                  placeholder="12 Broad Street, Victoria Island"
                />
              </label>
              <label className="space-y-2 text-sm text-on-surface-variant">
                LGA
                <input
                  className="w-full rounded-3xl border border-outline px-4 py-3 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                  value={form.lga}
                  onChange={(event) => setForm({ ...form, lga: event.target.value })}
                  placeholder="Victoria Island"
                />
              </label>
              <label className="space-y-2 text-sm text-on-surface-variant">
                State
                <input
                  className="w-full rounded-3xl border border-outline px-4 py-3 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                  value={form.state}
                  onChange={(event) => setForm({ ...form, state: event.target.value })}
                  placeholder="Lagos State"
                />
              </label>

              {formError && <div className="md:col-span-2 rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>}

              <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <button type="button" onClick={closeModal} className="rounded-full border border-outline px-5 py-3 text-sm font-semibold text-on-surface hover:bg-surface-low transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={submitLoading} className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-container transition-all disabled:opacity-60">
                  {editingPharmacy ? 'Save changes' : 'Create pharmacy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
