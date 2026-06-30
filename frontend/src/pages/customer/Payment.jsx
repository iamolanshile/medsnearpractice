import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function Payment() {
  const { state } = useLocation()
  const order = state?.order
  const navigate = useNavigate()
  const [proofUrl, setProofUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')


  const handleFile = async (e) => {
    const file = e.target.files[0]
    setUploading(true)
    try {
      const data = new FormData()
      data.append('file', file)
      data.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'medfindng_proofs')
      const res = await fetch(
        String.fromCharCode(96) + 'https://api.cloudinary.com/v1_1/' + String.fromCharCode(36) + '{import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload' + String.fromCharCode(96),
        { method: 'POST', body: data }
      )
      const json = await res.json()
      setProofUrl(json.secure_url)
    } catch { setError('Upload failed. Try again.') }
    finally { setUploading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post(String.fromCharCode(96) + '/customer/orders/' + String.fromCharCode(36) + '{order._id}/payment-proof' + String.fromCharCode(96), { proof_url: proofUrl })
      setSubmitted(true)
    } catch (err) { setError(err.error || 'Submission failed') }
  }

  if (submitted) return (
    <div className='max-w-lg mx-auto px-4 py-16 text-center'>
      <div className='text-5xl mb-4'>checkmark</div>
      <h1 className='text-2xl font-black text-on-surface tracking-tight'>Payment proof submitted</h1>
      <p className='text-on-surface-variant mt-2 text-sm'>We confirm within 30 minutes then process your order.</p>
      <button onClick={() => navigate(String.fromCharCode(96) + '/orders/' + String.fromCharCode(36) + '{order._id}' + String.fromCharCode(96))} className='btn-primary mt-6 px-8 py-3'>Track order</button>
    </div>
  )

  return (
    <div className='max-w-lg mx-auto px-4 py-8'>
      <h1 className='text-2xl font-black text-on-surface tracking-tight mb-6'>Make payment</h1>
      <div className='bg-primary text-white rounded-xl p-6 mb-6'>
        <p className='text-xs font-bold uppercase tracking-widest text-white/70 mb-3'>Transfer to</p>
        <div className='space-y-1.5'>
          <div className='flex justify-between'><span className='text-sm text-white/70'>Bank</span><span className='font-bold'>{order.payment?.bank_name}</span></div>
          <div className='flex justify-between'><span className='text-sm text-white/70'>Account</span><span className='font-black text-xl tracking-widest'>{order.payment?.account_number}</span></div>
          <div className='flex justify-between'><span className='text-sm text-white/70'>Name</span><span className='font-bold'>{order.payment?.account_name}</span></div>
          <div className='flex justify-between border-t border-white/20 pt-2 mt-2'><span className='text-sm text-white/70'>Amount</span><span className='font-black text-2xl'>₦{order.payment?.amount?.toLocaleString()}</span></div>
        </div>
      </div>
      {error && <div className='mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm'>{error}</div>}
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className='label'>Payment proof (screenshot / receipt)</label>
          <input type='file' accept='image/*' className='input-field py-2' onChange={handleFile} />
          {uploading && <p className='text-xs text-on-surface-variant mt-1'>Uploading...</p>}
          {proofUrl && <p className='text-xs text-green-600 mt-1'>Proof uploaded successfully</p>}
        </div>
        <button type='submit' disabled={uploading} className='btn-primary w-full justify-center py-4 disabled:opacity-60'>Submit payment proof</button>
      </form>
    </div>
  )
}