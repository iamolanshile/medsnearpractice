const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const supabase = require('../lib/supabase')
const auth = require('../middleware/auth')
const { calculatePayout } = require('../services/payout')

const router = express.Router()

// First-time admin setup — only works if no admins exist yet
router.post('/setup', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

  const { count } = await supabase.from('admins').select('*', { count: 'exact', head: true })
  if (count > 0) return res.status(403).json({ error: 'Admin already exists. Use /login.' })

  const hash = await bcrypt.hash(password, 10)
  const { data, error } = await supabase
    .from('admins')
    .insert({ email, password_hash: hash })
    .select('id, email')
    .single()

  if (error) return res.status(400).json({ error: error.message })
  res.json({ message: 'Admin account created. You can now log in.', email: data.email })
})

// Admin login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const { data: admin, error } = await supabase
    .from('admins')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !admin) return res.status(401).json({ error: 'Invalid credentials' })

  const valid = await bcrypt.compare(password, admin.password_hash)
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

  const token = jwt.sign({ id: admin.id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' })
  res.json({ token })
})

// Platform analytics
router.get('/analytics', auth('admin'), async (req, res) => {
  const [
    { count: totalOrders },
    { count: pendingOrders },
    { count: deliveredOrders },
    { count: totalAgents },
    { count: totalPharmacies },
    { count: totalInventory }
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'delivered'),
    supabase.from('agents').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('pharmacies').select('*', { count: 'exact', head: true }),
    supabase.from('inventory').select('*', { count: 'exact', head: true })
  ])

  // Top searched drugs (from orders)
  const { data: topDrugs } = await supabase
    .from('orders')
    .select('drug_name')
    .limit(200)

  const drugCounts = {}
  topDrugs?.forEach(o => {
    drugCounts[o.drug_name] = (drugCounts[o.drug_name] || 0) + 1
  })
  const mostSearched = Object.entries(drugCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([drug, count]) => ({ drug, count }))

  res.json({
    orders: { total: totalOrders, pending: pendingOrders, delivered: deliveredOrders },
    agents: totalAgents,
    pharmacies: totalPharmacies,
    inventory: totalInventory,
    mostSearched
  })
})

// List all agents — include state and verification_status
router.get('/agents', auth('admin'), async (req, res) => {
  const { status } = req.query
  let query = supabase.from('agents').select('id, name, email, phone, region, state, lga, status, verification_status, created_at')
  if (status) query = query.eq('status', status)
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// Update agent status
router.patch('/agents/:id', auth('admin'), async (req, res) => {
  const { status } = req.body
  const { data, error } = await supabase
    .from('agents')
    .update({ status })
    .eq('id', req.params.id)
    .select()
    .single()
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

// All pharmacies + inventory
router.get('/pharmacies', auth('admin'), async (req, res) => {
  const { data, error } = await supabase
    .from('pharmacies')
    .select('*, inventory(id, drug_name, brand, price, quantity, is_available, uploaded_at)')
    .order('created_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// All orders
router.get('/orders', auth('admin'), async (req, res) => {
  const { status, page = 1 } = req.query
  const limit = 25
  const from = (page - 1) * limit

  let query = supabase
    .from('orders')
    .select('*, pharmacies(name, address), agents(name, phone)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1)

  if (status) query = query.eq('status', status)
  const { data, count, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  res.json({ data, total: count, page: parseInt(page) })
})

// Update order status
router.patch('/orders/:id', auth('admin'), async (req, res) => {
  const { status, payment_confirmed } = req.body
  const updates = {}
  if (status) updates.status = status
  if (payment_confirmed !== undefined) updates.payment_confirmed = payment_confirmed

  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single()
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

// Monthly payout overview
router.get('/payouts', auth('admin'), async (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7)
  const payouts = await calculatePayout(month)
  res.json(payouts)
})

// Approve payout for agent
router.post('/payouts/approve', auth('admin'), async (req, res) => {
  const { agent_id, month } = req.body
  const month_str = month || new Date().toISOString().slice(0, 7)

  const { count: uploadCount } = await supabase
    .from('inventory')
    .select('*', { count: 'exact', head: true })
    .eq('agent_id', agent_id)
    .gte('uploaded_at', `${month_str}-01`)
    .lt('uploaded_at', getNextMonth(month_str))

  const rate = parseFloat(process.env.PAYOUT_RATE_PER_UPLOAD || 50)
  const bonus = uploadCount >= 100 ? 2000 : uploadCount >= 50 ? 1000 : 0
  const total = uploadCount * rate + bonus

  const { data, error } = await supabase
    .from('payouts')
    .upsert({
      agent_id,
      month: month_str,
      upload_count: uploadCount,
      rate_per_upload: rate,
      bonus,
      total_amount: total,
      status: 'approved',
      approved_by: req.user.id
    }, { onConflict: 'agent_id,month' })
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

// Mark payout as paid
router.patch('/payouts/:id/paid', auth('admin'), async (req, res) => {
  const { data, error } = await supabase
    .from('payouts')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single()
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

function getNextMonth(monthStr) {
  const [y, m] = monthStr.split('-').map(Number)
  const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`
  return `${next}-01`
}

// Platform settings — get all
router.get('/settings', auth('admin'), async (req, res) => {
  const { data, error } = await supabase.from('platform_settings').select('*').order('key')
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// Platform settings — update one
router.patch('/settings/:key', auth('admin'), async (req, res) => {
  const { value } = req.body
  if (value === undefined) return res.status(400).json({ error: 'Value required' })
  const { data, error } = await supabase
    .from('platform_settings')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('key', req.params.key)
    .select()
    .single()
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

// Agent verifications list
router.get('/verifications', auth('admin'), async (req, res) => {
  const { status } = req.query
  let query = supabase
    .from('agent_verifications')
    .select('*, agents(name, email, phone, state, lga)')
    .order('submitted_at', { ascending: false })
  if (status) query = query.eq('status', status)
  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// Review verification
router.patch('/verifications/:agentId', auth('admin'), async (req, res) => {
  const { status, rejection_reason } = req.body
  const { agentId } = req.params

  const { data, error } = await supabase
    .from('agent_verifications')
    .update({ status, rejection_reason, reviewed_by: req.user.id, reviewed_at: new Date().toISOString() })
    .eq('agent_id', agentId)
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  // Sync verification_status on agent
  await supabase.from('agents')
    .update({ verification_status: status === 'approved' ? 'verified' : status })
    .eq('id', agentId)

  res.json(data)
})

module.exports = router
