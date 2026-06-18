require('dotenv').config()
const fs = require('fs')
const express = require('express')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const morgan = require('morgan')
const path = require('path')
const connectDB = require('./src/config/database')

const agentRoutes = require('./src/routes/agent')
const adminRoutes = require('./src/routes/admin')
const orderRoutes = require('./src/routes/orders')

const app = express()

// Connect to MongoDB
connectDB()

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(fileUpload({ limits: { fileSize: 5 * 1024 * 1024 } }))

// Ensure upload folder exists
fs.mkdirSync(path.join(__dirname, 'uploads', 'payment-proofs'), { recursive: true })

// Serve public files
app.use('/public', express.static(path.join(__dirname, 'public')))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// API routes
app.use('/api/agent', agentRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/orders', orderRoutes)

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'MedsNear', db: 'MongoDB' }))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 MedsNear backend running on http://localhost:${PORT}`)
})
