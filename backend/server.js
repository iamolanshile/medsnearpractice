require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const path = require('path')
const connectDB = require('./src/config/database')

const agentRoutes = require('./src/routes/agent')
const adminRoutes = require('./src/routes/admin')

const app = express()

// Connect to MongoDB
connectDB()

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve public files
app.use('/public', express.static(path.join(__dirname, 'public')))

// API routes
app.use('/api/agent', agentRoutes)
app.use('/api/admin', adminRoutes)

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'MedsNear', db: 'MongoDB' }))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 MedsNear backend running on http://localhost:${PORT}`)
})
