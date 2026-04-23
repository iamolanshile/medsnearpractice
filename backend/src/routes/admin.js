const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const auth = require('../middleware/auth')
const Admin = require('../models/Admin')
const Agent = require('../models/Agent')
const AgentVerification = require('../models/AgentVerification')
const Pharmacy = require('../models/Pharmacy')
const Inventory = require('../models/Inventory')
const Order = require('../models/Order')
const Payout = require('../models/Payout')
const PlatformSetting = require('../models/PlatformSetting')

const router = express.Router()

// First-time admin setup
router.post('/setup', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
    const count = await Admin.countDocuments()
    if (count > 0) return res.status(403).json({ error: 'Admin already exists. Use /login.' })
    const hash = await bcrypt.hash(password, 10)
    const admin = await Admin.create({ email, password_hash: hash })
    res.json({ message: 'Admin account created.', email: admin.email })
  } catch (e) { res.status(400).json({ error: e.message }) }
})

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const admin = await Admin.findOne({ email: email.toLowerCase() })
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' })
    const valid = await bcrypt.compare(password, admin.password_hash)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })
    const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' })
    res.json({ token })
  } catch (e) { res.status(400).json({ error: e.message }) }
})

// Analytics
router.get('/analytics', auth('admin'), async (req, res) => {
  try {
    const [totalOrders, pendingOrders, deliveredOrders, totalAgents, totalPharmacies, totalInventory] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'delivered' }),
      Agent.countDocuments({ status: 'active' }),
      Pharmacy.countDocuments(),
      Inventory.countDocuments(),
    ])
    const topDrugs = await Order.aggregate([
      { $group: { _id: '$drug_name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { drug: '$_id', count: 1, _id: 0 } }
    ])
    res.json({ orders: { total: totalOrders, pending: pendingOrders, delivered: deliveredOrders }, agents: totalAgents, pharmacies: totalPharmacies, inventory: totalInventory, mostSearched: topDrugs })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// List agents
router.get('/agents', auth('admin'), async (req, res) => {
  try {
    const { status } = req.query
    const filter = status ? { status } : {}
    const agents = await Agent.find(filter).select('-password_hash').sort({ createdAt: -1 })
    res.json(agents)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Update agent status
router.patch('/agents/:id', auth('admin'), async (req, res) => {
  try {
    const { status } = req.body
    const agent = await Agent.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-password_hash')
    if (!agent) return res.status(404).json({ error: 'Agent not found' })
    res.json(agent)
  } catch (e) { res.status(400).json({ error: e.message }) }
})

// All pharmacies
router.get('/pharmacies', auth('admin'), async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find().sort({ createdAt: -1 })
    res.json(pharmacies)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// All orders
router.get('/orders', auth('admin'), async (req, res) => {
  try {
    const { status, page = 1 } = req.query
    const limit = 25
    const filter = status ? { status } : {}
    const [data, total] = await Promise.all([
      Order.find(filter).populate('pharmacy_id', 'name address').populate('agent_id', 'name phone').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Order.countDocuments(filter)
    ])
    res.json({ data, total, page: parseInt(page) })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Update order
router.patch('/orders/:id', auth('admin'), async (req, res) => {
  try {
    const { status, payment_confirmed } = req.body
    const updates = {}
    if (status) updates.status = status
    if (payment_confirmed !== undefined) updates.payment_confirmed = payment_confirmed
    const order = await Order.findByIdAndUpdate(req.params.id, updates, { new: true })
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.json(order)
  } catch (e) { res.status(400).json({ error: e.message }) }
})

// Payouts
router.get('/payouts', auth('admin'), async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7)
    const [y, m] = month.split('-').map(Number)
    const start = new Date(y, m - 1, 1)
    const end = new Date(m === 12 ? y + 1 : y, m === 12 ? 0 : m, 1)

    const agents = await Agent.find({ status: 'active' }).select('name email state lga')
    const results = await Promise.all(agents.map(async (agent) => {
      const uploadCount = await Inventory.countDocuments({ agent_id: agent._id, createdAt: { $gte: start, $lt: end } })
      const rate = uploadCount >= 350 ? 200 : uploadCount >= 200 ? 170 : 150
      const bonus = uploadCount >= 200 ? uploadCount * 20 : 0
      const total = uploadCount * rate + bonus
      const payout = await Payout.findOne({ agent_id: agent._id, month })
      return { agent, uploadCount, rate, bonus, total, status: payout?.status || 'pending', payout_id: payout?._id }
    }))
    res.json(results)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Approve payout
router.post('/payouts/approve', auth('admin'), async (req, res) => {
  try {
    const { agent_id, month } = req.body
    const month_str = month || new Date().toISOString().slice(0, 7)
    const [y, m] = month_str.split('-').map(Number)
    const start = new Date(y, m - 1, 1)
    const end = new Date(m === 12 ? y + 1 : y, m === 12 ? 0 : m, 1)
    const uploadCount = await Inventory.countDocuments({ agent_id, createdAt: { $gte: start, $lt: end } })
    const rate = uploadCount >= 350 ? 200 : uploadCount >= 200 ? 170 : 150
    const bonus = uploadCount >= 200 ? uploadCount * 20 : 0
    const total = uploadCount * rate + bonus
    const payout = await Payout.findOneAndUpdate(
      { agent_id, month: month_str },
      { upload_count: uploadCount, rate_per_upload: rate, bonus, total_amount: total, status: 'approved', approved_by: req.user.id },
      { upsert: true, new: true }
    )
    res.json(payout)
  } catch (e) { res.status(400).json({ error: e.message }) }
})

// Mark payout paid
router.patch('/payouts/:id/paid', auth('admin'), async (req, res) => {
  try {
    const payout = await Payout.findByIdAndUpdate(req.params.id, { status: 'paid', paid_at: new Date() }, { new: true })
    if (!payout) return res.status(404).json({ error: 'Payout not found' })
    res.json(payout)
  } catch (e) { res.status(400).json({ error: e.message }) }
})

// Settings
router.get('/settings', auth('admin'), async (req, res) => {
  try {
    const settings = await PlatformSetting.find().sort('key')
    res.json(settings)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.patch('/settings/:key', auth('admin'), async (req, res) => {
  try {
    const { value } = req.body
    if (value === undefined) return res.status(400).json({ error: 'Value required' })
    const setting = await PlatformSetting.findOneAndUpdate({ key: req.params.key }, { value }, { new: true, upsert: true })
    res.json(setting)
  } catch (e) { res.status(400).json({ error: e.message }) }
})

// Verifications
router.get('/verifications', auth('admin'), async (req, res) => {
  try {
    const { status } = req.query
    const filter = status ? { status } : {}
    const verifs = await AgentVerification.find(filter).populate('agent_id', 'name email phone state lga').sort({ createdAt: -1 })
    res.json(verifs)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.patch('/verifications/:agentId', auth('admin'), async (req, res) => {
  try {
    const { status, rejection_reason } = req.body
    const verif = await AgentVerification.findOneAndUpdate(
      { agent_id: req.params.agentId },
      { status, rejection_reason, reviewed_by: req.user.id, reviewed_at: new Date() },
      { new: true }
    )
    if (!verif) return res.status(404).json({ error: 'Verification not found' })
    await Agent.findByIdAndUpdate(req.params.agentId, { verification_status: status === 'approved' ? 'verified' : status })
    res.json(verif)
  } catch (e) { res.status(400).json({ error: e.message }) }
})

module.exports = router
