const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const supabase = require('../lib/supabase')
const auth = require('../middleware/auth')

const router = express.Router()

// ── Register ──────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { name, phone, email, password, state, lga, id_address, pharmacies } = req.body
  if (!name || !phone || !email || !password || !state || !lga)
    return res.status(400).json({ error: 'All required fields must be filled' })

  const hash = await bcrypt.hash(password, 10)
  const { data, error } = await supabase
    .from('agents')
    .insert({ name, phone, email, password_hash: hash, region: state, state, lga, id_address })
    .select('id, name, email, status')
    .single()

  if (error) return res.status(400).json({ error: error.message })

  // Save pharmacy names if provided
  if (pharmacies?.length) {
    const pharmRows = pharmacies
      .filter(p => p.trim())
      .map(name => ({ name, address: 'Pending verification', added_by: data.id }))

    if (pharmRows.length) {
      await supabase.from('pharmacies').insert(pharmRows)
    }
  }

  res.json({ message: 'Registration submitted. Complete verification to get approved.', agent: data })
})

// ── Login ─────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const { data: agent, error } = await supabase
    .from('agents')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !agent) return res.status(401).json({ error: 'Invalid credentials' })
  if (agent.status !== 'active') return res.status(403).json({ error: `Account ${agent.status}. Contact support.` })

  const valid = await bcrypt.compare(password, agent.password_hash)
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

  const token = jwt.sign({ id: agent.id, role: 'agent', name: agent.name }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.json({
    token,
    agent: { id: agent.id, name: agent.name, email: agent.email, region: agent.region, verification_status: agent.verification_status }
  })
})

// ── Upload verification document ──────────────────────
router.post('/verify', auth('agent'), async (req, res) => {
  const { doc_type, doc_number, id_address } = req.body
  if (!doc_type || !doc_number) return res.status(400).json({ error: 'Document type and number required' })
  if (!req.files?.document) return res.status(400).json({ error: 'Document file required' })

  const file = req.files.document
  const filename = `verifications/${req.user.id}/${Date.now()}_${file.name}`
  const { error: uploadErr } = await supabase.storage
    .from('agent-docs')
    .upload(filename, file.data, { contentType: file.mimetype })

  if (uploadErr) return res.status(500).json({ error: 'File upload failed: ' + uploadErr.message })

  const { data: urlData } = supabase.storage.from('agent-docs').getPublicUrl(filename)

  const { data, error } = await supabase
    .from('agent_verifications')
    .upsert({
      agent_id: req.user.id,
      doc_type,
      doc_number,
      doc_url: urlData.publicUrl,
      id_address,
      status: 'pending'
    }, { onConflict: 'agent_id' })
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  // Update agent verification_status
  await supabase.from('agents').update({ verification_status: 'pending' }).eq('id', req.user.id)

  res.json({ message: 'Verification submitted. Admin will review shortly.', verification: data })
})

// ── Upload signed consent form ────────────────────────
router.post('/consent', auth('agent'), async (req, res) => {
  const { pharmacy_id } = req.body
  if (!req.files?.consent) return res.status(400).json({ error: 'Consent form file required' })

  const file = req.files.consent
  const filename = `consent/${req.user.id}/${Date.now()}_${file.name}`
  const { error: uploadErr } = await supabase.storage
    .from('agent-docs')
    .upload(filename, file.data, { contentType: file.mimetype })

  if (uploadErr) return res.status(500).json({ error: 'Upload failed: ' + uploadErr.message })

  const { data: urlData } = supabase.storage.from('agent-docs').getPublicUrl(filename)

  if (pharmacy_id) {
    // Link consent to specific pharmacy
    await supabase.from('agent_pharmacies')
      .upsert({ agent_id: req.user.id, pharmacy_id, consent_form_url: urlData.publicUrl }, { onConflict: 'agent_id,pharmacy_id' })
  } else {
    // Store on verification record
    await supabase.from('agent_verifications')
      .update({ consent_form_url: urlData.publicUrl })
      .eq('agent_id', req.user.id)
  }

  res.json({ message: 'Consent form uploaded.', url: urlData.publicUrl })
})

// ── Get verification status ───────────────────────────
router.get('/verify/status', auth('agent'), async (req, res) => {
  const { data } = await supabase
    .from('agent_verifications')
    .select('doc_type, status, rejection_reason, submitted_at')
    .eq('agent_id', req.user.id)
    .single()
  res.json(data || { status: 'not_submitted' })
})

// ── Dashboard ─────────────────────────────────────────
router.get('/dashboard', auth('agent'), async (req, res) => {
  const agentId = req.user.id
  const month = new Date().toISOString().slice(0, 7)

  const { count: uploadCount } = await supabase
    .from('inventory')
    .select('*', { count: 'exact', head: true })
    .eq('agent_id', agentId)
    .gte('uploaded_at', `${month}-01`)

  // Load payout settings from DB
  const { data: settings } = await supabase
    .from('platform_settings')
    .select('key, value')
    .in('key', ['payout_rate_per_upload', 'bonus_tier_1_uploads', 'bonus_tier_1_amount', 'bonus_tier_2_uploads', 'bonus_tier_2_amount'])

  const cfg = Object.fromEntries((settings || []).map(s => [s.key, parseFloat(s.value)]))
  const rate = cfg.payout_rate_per_upload || 50
  const bonus = uploadCount >= (cfg.bonus_tier_2_uploads || 100)
    ? (cfg.bonus_tier_2_amount || 2000)
    : uploadCount >= (cfg.bonus_tier_1_uploads || 50)
      ? (cfg.bonus_tier_1_amount || 1000)
      : 0
  const projected = uploadCount * rate + bonus

  const { data: recentUploads } = await supabase
    .from('inventory')
    .select('id, drug_name, brand, price, quantity, uploaded_at, pharmacies(name)')
    .eq('agent_id', agentId)
    .order('uploaded_at', { ascending: false })
    .limit(10)

  res.json({ month, uploadCount, projectedEarnings: projected, rate, bonus, recentUploads })
})

// ── Pharmacies ────────────────────────────────────────
router.get('/pharmacies', auth('agent'), async (req, res) => {
  const { q } = req.query
  let query = supabase.from('pharmacies').select('id, name, address, lga, state').limit(30)
  if (q) query = query.ilike('name', `%${q}%`)
  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

router.post('/pharmacies', auth('agent'), async (req, res) => {
  const { name, address, lga, state, phone, lat, lng } = req.body
  if (!name || !address) return res.status(400).json({ error: 'Name and address required' })

  const location = lat && lng ? `POINT(${lng} ${lat})` : null
  const { data, error } = await supabase
    .from('pharmacies')
    .insert({ name, address, lga, state, phone, lat, lng, location, added_by: req.user.id })
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

// ── Inventory ─────────────────────────────────────────
router.post('/inventory', auth('agent'), async (req, res) => {
  const { pharmacy_id, drug_name, brand, price, quantity, expiry_date } = req.body
  if (!pharmacy_id || !drug_name || !price || quantity === undefined)
    return res.status(400).json({ error: 'Missing required fields' })

  let photo_url = null
  if (req.files?.photo) {
    const file = req.files.photo
    const filename = `${req.user.id}/${Date.now()}_${file.name}`
    const { error: uploadErr } = await supabase.storage
      .from('medication-photos')
      .upload(filename, file.data, { contentType: file.mimetype })

    if (!uploadErr) {
      const { data: urlData } = supabase.storage.from('medication-photos').getPublicUrl(filename)
      photo_url = urlData.publicUrl
    }
  }

  const { data, error } = await supabase
    .from('inventory')
    .insert({ pharmacy_id, agent_id: req.user.id, drug_name, brand, price, quantity, expiry_date, photo_url })
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })
  res.json({ message: 'Inventory uploaded successfully', entry: data })
})

router.get('/inventory/history', auth('agent'), async (req, res) => {
  const { page = 1 } = req.query
  const limit = 20
  const from = (page - 1) * limit

  const { data, count, error } = await supabase
    .from('inventory')
    .select('*, pharmacies(name, address)', { count: 'exact' })
    .eq('agent_id', req.user.id)
    .order('uploaded_at', { ascending: false })
    .range(from, from + limit - 1)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ data, total: count, page: parseInt(page) })
})

module.exports = router
