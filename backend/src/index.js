require('dotenv').config()
const express = require('express')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const fs = require('fs')
const path = require('path')

const agentRoutes = require('./routes/agent')
const adminRoutes = require('./routes/admin')
const orderRoutes = require('./routes/orders')
const whatsappRoutes = require('./routes/whatsapp')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(fileUpload({ limits: { fileSize: 5 * 1024 * 1024 } }))

fs.mkdirSync(path.join(__dirname, '../uploads', 'payment-proofs'), { recursive: true })

// Serve public files (consent form etc.) — no auth required
app.use('/public', express.static(path.join(__dirname, '../public')))
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Consent form direct download
app.get('/consent-form', (req, res) => {
  res.download(
    path.join(__dirname, '../public/consent-form.html'),
    'MedsNear_Pharmacy_Consent_Form.html'
  )
})

// API routes
app.use('/api/agent', agentRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/whatsapp', whatsappRoutes)

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'MedsNear' }))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`MedsNear backend running on http://localhost:${PORT}`)
})
