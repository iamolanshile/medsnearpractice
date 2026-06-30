const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const auth = require('../middleware/auth')
const Agent = require('../models/Agent')
const AgentVerification = require('../models/AgentVerification')
const Pharmacy = require('../models/Pharmacy')
const Inventory = require('../models/Inventory')
const AuthLog = require('../models/AuthLog')

const router = express.Router()

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, phone, email, password, state, lga, id_address } = req.body
    if (!name || !phone || !email || !password || !state || !lga)
      return res.status(400).json({ error: 'All required fields must be filled' })
    const hash = await bcrypt.hash(password, 10)
    const agent = await Agent.create({ name, phone, email: email.toLowerCase(), password_hash: hash, state, lga, region: state, id_address })
    res.json({ message: 'Registration successful. You can now sign in.', agent: { id: agent._id, name: agent.name, email: agent.email, status: agent.status } })
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ error: 'Email already registered' })
    res.status(400).json({ error: e.message })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const authMeta = {
      user_type: 'agent',
      email: email?.toLowerCase?.() || null,
      action: 'login',
      ip: req.ip,
      user_agent: req.get('User-Agent') || null,
    }

    const agent = await Agent.findOne({ email: email.toLowerCase() })
    if (!agent) {
      await AuthLog.create({ ...authMeta, status: 'failure', message: 'Agent not found' })
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    if (agent.status !== 'active') {
      await AuthLog.create({ ...authMeta, status: 'failure', message: `Agent account ${agent.status}` })
      return res.status(403).json({
        error: agent.status === 'pending'
          ? 'Your account is pending verification. Please check back once an admin has approved your registration.'
          : 'Your account has been suspended. Please contact support.',
        code: agent.status === 'pending' ? 'ACCOUNT_PENDING' : 'ACCOUNT_SUSPENDED',
      })
    }

    const valid = await bcrypt.compare(password, agent.password_hash)
    if (!valid) {
      await AuthLog.create({ ...authMeta, status: 'failure', user_id: agent._id, message: 'Invalid password' })
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign({ id: agent._id, role: 'agent', name: agent.name }, process.env.JWT_SECRET, { expiresIn: '7d' })
    await AuthLog.create({ ...authMeta, status: 'success', user_id: agent._id, message: 'Agent login successful' })
    res.json({ token, agent: { id: agent._id, name: agent.name, email: agent.email, region: agent.region, verification_status: agent.verification_status } })
  } catch (e) {
    await AuthLog.create({ user_type: 'agent', action: 'login', status: 'failure', ip: req.ip, user_agent: req.get('User-Agent') || null, message: e.message })
    res.status(400).json({ error: e.message })
  }
})

// Dashboard
router.get('/dashboard', auth('agent'), async (req, res) => {
  try {
    const agentId = req.user.id
    const month = new Date().toISOString().slice(0, 7)
    const [y, m] = month.split('-').map(Number)
    const start = new Date(y, m - 1, 1)
    const end = new Date(m === 12 ? y + 1 : y, m === 12 ? 0 : m, 1)
    const uploadCount = await Inventory.countDocuments({ agent_id: agentId, createdAt: { $gte: start, $lt: end } })
    const rate = uploadCount >= 350 ? 200 : uploadCount >= 200 ? 170 : 150
    const bonus = uploadCount >= 200 ? uploadCount * 20 : 0
    const projected = uploadCount * rate + bonus
    const recentUploads = await Inventory.find({ agent_id: agentId }).populate('pharmacy_id', 'name').sort({ createdAt: -1 }).limit(10)
    res.json({ month, uploadCount, projectedEarnings: projected, rate, bonus, recentUploads })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Pharmacies
router.get('/pharmacies', auth('agent'), async (req, res) => {
  try {
    const { q } = req.query
    const filter = q ? { name: { $regex: q, $options: 'i' } } : {}
    const pharmacies = await Pharmacy.find(filter).select('name address lga state').limit(30)
    res.json(pharmacies)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/pharmacies', auth('agent'), async (req, res) => {
  try {
    const { name, address, lga, state, phone, lat, lng } = req.body
    if (!name || !address) return res.status(400).json({ error: 'Name and address required' })
    const pharmacy = await Pharmacy.create({ name, address, lga, state, phone, lat, lng, added_by: req.user.id })
    res.json(pharmacy)
  } catch (e) { res.status(400).json({ error: e.message }) }
})

// Inventory upload
router.post('/inventory', auth('agent'), async (req, res) => {
  try {
    const { pharmacy_id, drug_name, brand, price, quantity, expiry_date } = req.body
    if (!pharmacy_id || !drug_name || !price || quantity === undefined)
      return res.status(400).json({ error: 'Missing required fields' })
    const entry = await Inventory.create({ pharmacy_id, agent_id: req.user.id, drug_name, brand, price, quantity, expiry_date })
    res.json({ message: 'Inventory uploaded successfully', entry })
  } catch (e) { res.status(400).json({ error: e.message }) }
})

// Inventory history
router.get('/inventory/history', auth('agent'), async (req, res) => {
  try {
    const { page = 1 } = req.query
    const limit = 20
    const [data, total] = await Promise.all([
      Inventory.find({ agent_id: req.user.id }).populate('pharmacy_id', 'name address').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Inventory.countDocuments({ agent_id: req.user.id })
    ])
    res.json({ data, total, page: parseInt(page) })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Verification
router.post('/verify', auth('agent'), async (req, res) => {
  try {
    const { doc_type, doc_number, id_address } = req.body
    if (!doc_type || !doc_number) return res.status(400).json({ error: 'Document type and number required' })
    const verif = await AgentVerification.findOneAndUpdate(
      { agent_id: req.user.id },
      { doc_type, doc_number, id_address, status: 'pending' },
      { upsert: true, new: true }
    )
    await Agent.findByIdAndUpdate(req.user.id, { verification_status: 'pending' })
    res.json({ message: 'Verification submitted.', verification: verif })
  } catch (e) { res.status(400).json({ error: e.message }) }
})

router.get('/verify/status', auth('agent'), async (req, res) => {
  try {
    const verif = await AgentVerification.findOne({ agent_id: req.user.id }).select('doc_type status rejection_reason createdAt')
    res.json(verif || { status: 'not_submitted' })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

module.exports = router
