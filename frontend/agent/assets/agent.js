const API = '/api/agent'
let token = localStorage.getItem('mn_token')
let agentInfo = JSON.parse(localStorage.getItem('mn_agent') || 'null')
let selectedPharmacy = null
let historyPage = 1

// ── Init ──────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  if (token && agentInfo) {
    showScreen('screen-app')
    loadDashboard()
  } else {
    showScreen('screen-login')
  }
})

// ── Screens ───────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'))
  document.getElementById(id).classList.add('active')
}

function switchTab(tab) {
  document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none')
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'))
  document.getElementById(`tab-${tab}`).style.display = 'flex'
  document.getElementById(`tab-${tab}`).style.flexDirection = 'column'
  document.getElementById(`tab-btn-${tab}`).classList.add('active')

  if (tab === 'dashboard') loadDashboard()
  if (tab === 'history') loadHistory(1)
}

// ── Auth ──────────────────────────────────────────────
async function doLogin() {
  const email = document.getElementById('login-email').value.trim()
  const password = document.getElementById('login-password').value
  const alertEl = document.getElementById('login-alert')

  if (!email || !password) return showAlert(alertEl, 'Fill in all fields', 'error')

  try {
    const res = await post(`${API}/login`, { email, password })
    token = res.token
    agentInfo = res.agent
    localStorage.setItem('mn_token', token)
    localStorage.setItem('mn_agent', JSON.stringify(agentInfo))
    showScreen('screen-app')
    document.getElementById('agent-name-header').textContent = agentInfo.name
    loadDashboard()
  } catch (e) {
    showAlert(alertEl, e.message, 'error')
  }
}

async function doRegister() {
  const alertEl = document.getElementById('reg-alert')
  const body = {
    name: document.getElementById('reg-name').value.trim(),
    phone: document.getElementById('reg-phone').value.trim(),
    email: document.getElementById('reg-email').value.trim(),
    password: document.getElementById('reg-password').value,
    region: document.getElementById('reg-region').value
  }
  if (!body.name || !body.phone || !body.email || !body.password)
    return showAlert(alertEl, 'All fields are required', 'error')

  try {
    await post(`${API}/register`, body)
    showAlert(alertEl, 'Registration submitted! Await admin approval before logging in.', 'success')
  } catch (e) {
    showAlert(alertEl, e.message, 'error')
  }
}

function doLogout() {
  localStorage.removeItem('mn_token')
  localStorage.removeItem('mn_agent')
  token = null
  agentInfo = null
  showScreen('screen-login')
}

// ── Dashboard ─────────────────────────────────────────
async function loadDashboard() {
  if (agentInfo) document.getElementById('agent-name-header').textContent = agentInfo.name
  try {
    const data = await get(`${API}/dashboard`)
    document.getElementById('stat-uploads').textContent = data.uploadCount
    document.getElementById('stat-earnings').textContent = `₦${Number(data.projectedEarnings).toLocaleString()}`
    document.getElementById('stat-rate').textContent = data.rate
    document.getElementById('stat-bonus').textContent = Number(data.bonus).toLocaleString()

    const el = document.getElementById('recent-uploads')
    if (!data.recentUploads?.length) {
      el.innerHTML = '<div style="color:var(--muted); font-size:14px;">No uploads yet this month.</div>'
      return
    }
    el.innerHTML = data.recentUploads.map(u => `
      <div class="history-item">
        <div class="drug">${u.drug_name} ${u.brand ? `<span style="font-weight:400;">(${u.brand})</span>` : ''}</div>
        <div class="meta">${u.pharmacies?.name || ''} · ₦${Number(u.price).toLocaleString()} · Qty: ${u.quantity}</div>
        <div class="meta">${new Date(u.uploaded_at).toLocaleDateString('en-NG')}</div>
      </div>`).join('')
  } catch (e) {
    showAlert(document.getElementById('dash-alert'), 'Failed to load dashboard', 'error')
  }
}

// ── Pharmacy Search ───────────────────────────────────
let pharmTimer = null
async function searchPharmacies() {
  clearTimeout(pharmTimer)
  const q = document.getElementById('pharmacy-search').value.trim()
  if (q.length < 2) { document.getElementById('pharmacy-results').innerHTML = ''; return }

  pharmTimer = setTimeout(async () => {
    const data = await get(`${API}/pharmacies?q=${encodeURIComponent(q)}`)
    const el = document.getElementById('pharmacy-results')
    if (!data.length) { el.innerHTML = '<div style="color:var(--muted); font-size:13px; padding:8px 0;">No results. Add a new pharmacy below.</div>'; return }
    el.innerHTML = data.map(p => `
      <div class="pharmacy-result" onclick="selectPharmacy('${p.id}', '${escHtml(p.name)}', '${escHtml(p.address)}')">
        <strong>${p.name}</strong><br>
        <span style="font-size:13px; color:var(--muted);">${p.address}${p.lga ? ', ' + p.lga : ''}</span>
      </div>`).join('')
  }, 300)
}

function selectPharmacy(id, name, address) {
  selectedPharmacy = { id, name, address }
  document.getElementById('pharmacy-results').innerHTML = ''
  document.getElementById('pharmacy-search').value = ''
  document.getElementById('sel-pharm-name').textContent = name
  document.getElementById('sel-pharm-addr').textContent = address
  document.getElementById('selected-pharmacy').style.display = 'block'
  document.getElementById('step-pharmacy').querySelector('input').style.display = 'none'
}

function clearPharmacy() {
  selectedPharmacy = null
  document.getElementById('selected-pharmacy').style.display = 'none'
  document.getElementById('step-pharmacy').querySelector('input').style.display = 'block'
}

function showAddPharmacy() {
  document.getElementById('add-pharmacy-form').style.display = 'block'
}

async function addPharmacy() {
  const body = {
    name: document.getElementById('np-name').value.trim(),
    address: document.getElementById('np-address').value.trim(),
    lga: document.getElementById('np-lga').value.trim(),
    phone: document.getElementById('np-phone').value.trim()
  }
  if (!body.name || !body.address) return alert('Name and address required')

  // Try to get geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async pos => {
      body.lat = pos.coords.latitude
      body.lng = pos.coords.longitude
      await savePharmacy(body)
    }, async () => { await savePharmacy(body) })
  } else {
    await savePharmacy(body)
  }
}

async function savePharmacy(body) {
  try {
    const data = await post(`${API}/pharmacies`, body)
    selectPharmacy(data.id, data.name, data.address)
    document.getElementById('add-pharmacy-form').style.display = 'none'
    ;['np-name','np-address','np-lga','np-phone'].forEach(id => document.getElementById(id).value = '')
  } catch (e) {
    alert('Error: ' + e.message)
  }
}

// ── Inventory Upload ──────────────────────────────────
function previewPhoto() {
  const file = document.getElementById('drug-photo').files[0]
  if (!file) return
  const preview = document.getElementById('photo-preview')
  preview.src = URL.createObjectURL(file)
  preview.style.display = 'block'
}

async function submitInventory() {
  const alertEl = document.getElementById('upload-alert')
  if (!selectedPharmacy) return showAlert(alertEl, 'Please select a pharmacy first', 'error')

  const drugName = document.getElementById('drug-name').value.trim()
  const price = document.getElementById('drug-price').value
  const qty = document.getElementById('drug-qty').value

  if (!drugName || !price || qty === '') return showAlert(alertEl, 'Drug name, price, and quantity are required', 'error')

  const formData = new FormData()
  formData.append('pharmacy_id', selectedPharmacy.id)
  formData.append('drug_name', drugName)
  formData.append('brand', document.getElementById('drug-brand').value.trim())
  formData.append('price', price)
  formData.append('quantity', qty)
  formData.append('expiry_date', document.getElementById('drug-expiry').value)

  const photoFile = document.getElementById('drug-photo').files[0]
  if (photoFile) formData.append('photo', photoFile)

  try {
    const res = await fetch(`${API}/inventory`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)

    showAlert(alertEl, '✅ Upload successful!', 'success')
    // Reset form
    ;['drug-name','drug-brand','drug-price','drug-qty','drug-expiry'].forEach(id => document.getElementById(id).value = '')
    document.getElementById('photo-preview').style.display = 'none'
    document.getElementById('drug-photo').value = ''
    clearPharmacy()
    switchTab('dashboard')
  } catch (e) {
    showAlert(alertEl, e.message, 'error')
  }
}

// ── History ───────────────────────────────────────────
async function loadHistory(page) {
  historyPage = page
  try {
    const data = await get(`${API}/inventory/history?page=${page}`)
    const el = document.getElementById('history-list')
    if (!data.data?.length) { el.innerHTML = '<div style="color:var(--muted);">No uploads yet.</div>'; return }

    el.innerHTML = data.data.map(u => `
      <div class="history-item">
        <div class="drug">${u.drug_name} ${u.brand ? `(${u.brand})` : ''}</div>
        <div class="meta">${u.pharmacies?.name || ''} · ${u.pharmacies?.address || ''}</div>
        <div class="meta">₦${Number(u.price).toLocaleString()} · Qty: ${u.quantity} · ${new Date(u.uploaded_at).toLocaleDateString('en-NG')}</div>
      </div>`).join('')

    const pages = Math.ceil(data.total / 20)
    const pag = document.getElementById('history-pagination')
    pag.innerHTML = ''
    if (page > 1) pag.innerHTML += `<button class="btn btn-secondary" style="width:auto; padding:8px 16px; display:inline-block; margin-right:8px;" onclick="loadHistory(${page-1})">← Prev</button>`
    if (page < pages) pag.innerHTML += `<button class="btn btn-secondary" style="width:auto; padding:8px 16px; display:inline-block;" onclick="loadHistory(${page+1})">Next →</button>`
  } catch (e) {
    document.getElementById('history-list').innerHTML = '<div style="color:var(--muted);">Failed to load history.</div>'
  }
}

// ── Helpers ───────────────────────────────────────────
async function get(url) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

async function post(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

function showAlert(el, msg, type) {
  el.innerHTML = `<div class="alert alert-${type}">${msg}</div>`
  setTimeout(() => { el.innerHTML = '' }, 4000)
}

function escHtml(str) {
  return str?.replace(/'/g, "\\'").replace(/"/g, '&quot;') || ''
}
