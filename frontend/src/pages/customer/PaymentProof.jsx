import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function PaymentProof() {
  const location = useLocation()
  const navigate = useNavigate()
  const order = location.state?.order
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const { product, quantity = 1, subtotal = 0, total = 0 } = order || {}
  const orderId = order?._id || order?.id

  useEffect(() => {
    if (!orderId) {
      navigate('/customer/search', { replace: true })
    }
  }, [orderId, navigate])

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.')
      return
    }
    setFile(selectedFile)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const droppedFile = event.dataTransfer.files?.[0]
    if (droppedFile) {
      if (droppedFile.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.')
        return
      }
      setFile(droppedFile)
    }
  }

  const handleSubmit = async () => {
    if (!file || !orderId) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('payment_confirmed', 'true')
      formData.append('status', 'confirmed')
      formData.append('payment_reference', file.name)
      formData.append('proof', file)

      await api.patch(`/orders/${orderId}`, formData)
      setUploading(false)
      alert('Payment proof submitted successfully. Our team will verify it shortly.')
      navigate('/track-order', { state: { orderId } })
    } catch (error) {
      setUploading(false)
      alert(error?.error || 'Unable to submit payment proof. Please try again.')
    }
  }

  const copyAccount = async () => {
    try {
      await navigator.clipboard.writeText('1234567890')
      alert('Account number copied!')
    } catch {
      alert('Unable to copy to clipboard.')
    }
  }

  if (!order?.product) return null


  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <div className="bg-surface border-b border-outline-variant py-4 px-margin-mobile md:px-margin-desktop sticky top-16 z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">Order Process › Payment Verification</p>
            <h1 className="mt-2 text-3xl font-bold text-on-surface">Payment Verification</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate('/customer/search')}
            className="text-primary font-semibold hover:underline"
          >
            Back to search
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-8 space-y-6">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary-container/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' 1` }}>account_balance</span>
                </div>
                <div>
                  <h2 className="font-headline-md text-headline-md">Bank Transfer Details</h2>
                  <p className="text-label-md text-on-surface-variant">Instant verification after upload</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-label-sm uppercase tracking-wider text-on-surface-variant">Bank Name</p>
                  <p className="font-body-lg text-body-lg font-semibold">Zenith Bank</p>
                </div>
                <div className="space-y-1">
                  <p className="text-label-sm uppercase tracking-wider text-on-surface-variant">Account Name</p>
                  <p className="font-body-lg text-body-lg font-semibold">MedsNear Logistics</p>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <p className="text-label-sm uppercase tracking-wider text-on-surface-variant">Account Number</p>
                  <div className="flex items-center justify-between bg-white border border-outline-variant rounded-3xl p-4">
                    <span className="font-display-lg text-[24px] font-bold tracking-widest">1234567890</span>
                    <button onClick={copyAccount} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-container transition-all">
                      <span className="material-symbols-outlined">content_copy</span>
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="border-2 border-dashed border-outline-variant rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary transition-colors"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => document.getElementById('paymentProofInput').click()}
            >
              <input id="paymentProofInput" type="file" accept=".jpg,.png,.pdf" className="hidden" onChange={handleFileChange} />
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant">cloud_upload</span>
              </div>
              <p className="font-label-md text-label-md mb-1">Click to upload or drag and drop</p>
              <p className="text-label-sm text-on-surface-variant">JPG, PNG, PDF (Max 5MB)</p>
              {file && (
                <div className="mt-6 flex items-center justify-between w-full max-w-lg gap-3 rounded-2xl bg-white border border-outline-variant px-4 py-3">
                  <div>
                    <p className="font-body-md text-body-md font-semibold">{file.name}</p>
                    <p className="text-sm text-on-surface-variant">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null) }} className="text-error hover:bg-error/10 rounded-full p-2">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!file || uploading}
              className={`w-full rounded-3xl py-4 text-body-lg font-bold transition-all ${file ? 'bg-primary text-white hover:opacity-90' : 'bg-surface-container text-on-surface-variant cursor-not-allowed'}`}
            >
              {uploading ? 'Submitting...' : 'Submit for Verification'}
            </button>

            <div className="flex flex-wrap justify-center gap-6 mt-6 text-on-surface-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">lock</span>
                <span>Secure SSL Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">person_check</span>
                <span>Human-verified by our team</span>
              </div>
            </div>
          </section>

          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="bg-surface-container-high border border-outline-variant rounded-3xl p-6 shadow-sm">
                <h2 className="font-headline-md text-headline-md font-bold text-on-surface mb-6">Order Summary</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-3xl overflow-hidden bg-white border border-outline-variant">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-label-md text-label-md font-semibold">{product.name}</p>
                      <p className="text-sm text-on-surface-variant">{quantity} × {product.price}</p>
                    </div>
                  </div>

                  <div className="border-t border-outline-variant pt-4 space-y-3">
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Subtotal</span>
                      <span>₦{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Delivery Fee</span>
                      <span>₦200</span>
                    </div>
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Service Fee</span>
                      <span>₦150</span>
                    </div>
                    <div className="flex justify-between pt-2 font-bold text-on-surface">
                      <span>Total Amount</span>
                      <span>₦{total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-tertiary-container/30 bg-tertiary-fixed-dim/20 p-5 text-on-tertiary-fixed-variant">
                <p className="font-label-sm">Please ensure the transferred amount is exactly <strong>₦{total.toLocaleString()}</strong> to avoid delays.</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
