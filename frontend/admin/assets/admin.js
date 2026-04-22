const API = '/api/admin'
let adminToken = localStorage.getItem('mn_admin_token')
let currentPage = 'overview'
let ordersPage = 1

window.addEventListener('DOMContentLoaded', () => {
  const now = new Date()
  document.getElementById('topbar-month').textContent = now.toLocaleString('en-NG', { month: 'long', year: 'numeric' })
  document.getElementById('payout-month').value = now.toISOString().slice(0, 7)
  if (adminToken) {
    document.getElementById('login-overlay').style.display = 'none'
    loadOverview()
  }
})

// ── Auth ──────────────────────────────────────────────
function showSetup() {
  document.getElementById('login-section').style.display = 'none'
  document.getElementById('setup-section').style.display = 'block'
}

function showLogin() {
  document.getElementById('setup-section').style.display = 'none'
  document.getElementById('login-section').style.display = 'block'
}

async function doSetup() {
  const email = document.getElementById('setup-email').value.trim()
  const password = document.getElementById('setup-password').value
  const errEl = document.getElementById('setup-err')

  if (!email || !password) {
    errEl.innerHTML = `<div class="alert alert-error">Email and password required</div>`
    return
  }
  if (password.length < 8) {
    errEl.innerHTML = `<div class="alert alert-error">Password must be at least 8 characters</div>`
    return
  }

  try {
    const res = await fetch(`${API}/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)

    // Auto-fill login and switch
    document.getElementById('adm-email').value = email
    document.getElementById('adm-password').value = password
    showLogin()
    document.getElementById('login-err').innerHTML = `<div class="alert alert-success" style="background:#d4edda;color:#155724;">Account created! Logging you in...</div>`
    setTimeout(adminLogin, 800)
  } catch (e) {
    errEl.innerHTML = `<div class="alert alert-error">${e.message}</div>`
  }
}

async function adminLogin() {
  const email = document.getElementById('adm-email').value.trim()
  const password = document.getElementById('adm-password').value
  const errEl = document.getElementById('login-err')

  try {
    const res = await post(`${API}/login`, { email, password })
    adminToken = res.token
    localStorage.setItem('mn_admin_token', adminToken)
    document.getElementById('login-overlay').style.display = 'none'
    loadAnalytics()
  } catch (e) {
    errEl.innerHTML = `<div class="alert alert-error">${e.message}</div>`
  }
}

function adminLogout() {
  localStorage.removeItem('mn_admin_token')
  adminToken = null
  document.getElementById('login-overlay').style.display = 'flex'
}

function navigate(page) {
  currentPage = page
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'))
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'))
  document.getElementById(`page-${page}`).classList.add('active')
  // Desktop sidebar
  document.querySelectorAll('.nav-item[data-page]').forEach(n => {
    if (n.dataset.page === page) n.classList.add('active')
  })
  // Mobile bottom nav
  document.querySelectorAll('.mob-nav-btn').forEach(b => {
    const isActive = b.dataset.mob === page
    b.classList.toggle('text-blue-900', isActive)
    b.classList.toggle('bg-blue-50', isActive)
    b.classList.toggle('text-slate-500', !isActive)
  })
  const titles = {
    overview: 'MedsNear Overview', orders: 'Orders', inventory: 'Inventory',
    agents: 'Agents', verifications: 'Verifications', payouts: 'Payouts', settings: 'Settings'
  }
  document.getElementById('page-title').textContent = titles[page] || page

  const loaders = {
    overview: loadOverview,
    orders: () => loadOrders(1),
    inventory: loadInventory,
    agents: loadAgents,
    verifications: loadVerifications,
    payouts: loadPayouts,
    settings: loadSettings
  }
  loaders[page]?.()
}

// ── Overview (replaces Analytics) ────────────────────
async function loadOverview() {
  try {
    const d = await get(`${API}/analytics`)

    // KPI cards
    document.getElementById('kpi-orders').textContent = d.orders.total
    document.getElementById('kpi-agents').textContent = d.agents
    document.getElementById('kpi-pharmacies').textContent = d.pharmacies
    document.getElementById('kpi-inventory').textContent = d.inventory
    document.getElementById('ov-pending').textContent = d.orders.pending
    document.getElementById('ov-delivered').textContent = d.orders.delivered

    // Top searches bar chart
    const maxCount = d.mostSearched[0]?.count || 1
    document.getElementById('top-searches-list').innerHTML = d.mostSearched.slice(0, 5).map(r => `
      <div>
        <div class="flex justify-between text-sm mb-1.5">
          <span class="font-medium text-on-surface">${r.drug}</span>
          <span class="font-label font-bold text-primary">${r.count}</span>
        </div>
        <div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div class="h-full bg-primary rounded-full transition-all" style="width:${Math.round((r.count/maxCount)*100)}%"></div>
        </div>
      </div>`).join('') || '<p class="text-sm text-slate-400 font-label">No search data yet.</p>'

    // Recent orders preview (last 5)
    const ordersData = await get(`${API}/orders?page=1`)
    document.getElementById('overview-orders-table').innerHTML = ordersData.data.slice(0, 5).map(o => `
      <tr>
        <td class="font-mono text-xs text-slate-500">#${o.id.slice(0,8).toUpperCase()}</td>
        <td>
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">
              ${(o.customer_name || '?').slice(0,2).toUpperCase()}
            </div>
            <span class="font-medium text-sm">${o.customer_name || '—'}</span>
          </div>
        </td>
        <td class="font-medium text-sm">${o.drug_name}</td>
        <td class="text-sm text-slate-500">${o.pharmacies?.name || '—'}</td>
        <td>${orderStatusPill(o.status)}</td>
        <td class="font-bold text-sm">₦${Number(o.total_price || 0).toLocaleString()}</td>
      </tr>`).join('') || '<tr><td colspan="6" class="text-center text-slate-400 py-8 text-sm">No orders yet.</td></tr>'
  } catch (e) { console.error(e) }
}

function orderStatusPill(s) {
  const map = {
    pending: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-orange-100 text-orange-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700'
  }
  const cls = map[s] || 'bg-slate-100 text-slate-600'
  return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-label ${cls}">
    <span class="w-1.5 h-1.5 rounded-full bg-current"></span>${s?.toUpperCase() || '—'}
  </span>`
}

// Keep loadAnalytics as alias for backward compat
function loadAnalytics() { loadOverview() }

// ── Orders ────────────────────────────────────────────
async function loadOrders(page) {
  ordersPage = page
  const status = document.getElementById('order-status-filter').value
  const params = new URLSearchParams({ page })
  if (status) params.set('status', status)

  try {
    const d = await get(`${API}/orders?${params}`)
    const tbody = document.getElementById('orders-table')
    tbody.innerHTML = d.data.map(o => `
      <tr>
        <td style="font-family:monospace; font-size:12px;">#${o.id.slice(0,8).toUpperCase()}</td>
        <td>${o.customer_name || '—'}<br><span style="font-size:12px; color:var(--muted);">${o.customer_phone}</span></td>
        <td>${o.drug_name}</td>
        <td>${o.pharmacies?.name || '—'}</td>
        <td>${o.agents?.name || '—'}</td>
        <td>${statusBadge(o.status)}</td>
        <td>${o.payment_confirmed ? '<span class="badge badge-green">Verified</span>' : '<span class="badge badge-yellow">Pending</span>'}</td>
        <td>
          <select onchange="updateOrder('${o.id}', this.value)" style="padding:4px 6px; font-size:12px; border:1px solid var(--border); border-radius:4px;">
            <option value="">Change status</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          ${!o.payment_confirmed ? `<button class="btn btn-sm btn-primary" style="margin-top:4px;" onclick="verifyPayment('${o.id}')">Verify Pay</button>` : ''}
        </td>
      </tr>`).join('') || '<tr><td colspan="8" style="color:var(--muted); text-align:center;">No orders found</td></tr>'

    renderPagination('orders-pagination', page, Math.ceil(d.total / 25), loadOrders)
  } catch (e) { console.error(e) }
}

async function updateOrder(id, status) {
  if (!status) return
  try {
    await patch(`${API}/orders/${id}`, { status })
    loadOrders(ordersPage)
  } catch (e) { alert(e.message) }
}

async function verifyPayment(id) {
  try {
    await patch(`${API}/orders/${id}`, { payment_confirmed: true })
    loadOrders(ordersPage)
  } catch (e) { alert(e.message) }
}

// ── Inventory — card-based layout ────────────────────
async function loadInventory() {
  try {
    const data = await get(`${API}/pharmacies`)
    const el = document.getElementById('inventory-list')
    if (!data.length) {
      el.innerHTML = '<p class="text-slate-400 text-sm py-4">No pharmacies yet.</p>'
      return
    }

    el.innerHTML = data.map(p => `
      <div class="mb-8">
        <!-- Pharmacy header -->
        <div class="flex items-start justify-between mb-4">
          <div>
            <h5 class="font-bold text-base text-on-surface">${p.name}</h5>
            <p class="text-xs text-slate-500 mt-0.5">${p.address}${p.lga ? ', ' + p.lga : ''}${p.state ? ', ' + p.state : ''}</p>
          </div>
          <span class="text-[10px] font-label font-bold bg-primary/10 text-primary px-2 py-1 rounded-full">${p.inventory?.length || 0} items</span>
        </div>

        ${p.inventory?.length ? `
        <!-- Drug cards grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          ${p.inventory.map(i => `
            <div class="bg-white border border-slate-200 rounded-xl p-4 hover:-translate-y-0.5 transition-transform">
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-sm text-on-surface truncate">${i.drug_name}</p>
                  ${i.brand ? `<p class="text-xs text-slate-400 mt-0.5">${i.brand}</p>` : ''}
                </div>
                <span class="ml-2 flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-label ${i.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                  <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                  ${i.is_available ? 'In Stock' : 'Out'}
                </span>
              </div>
              <div class="flex items-end justify-between">
                <div>
                  <p class="text-xl font-black text-primary">₦${Number(i.price).toLocaleString()}</p>
                  <p class="text-xs text-slate-400 mt-0.5">Qty: ${i.quantity}</p>
                </div>
                <p class="text-[10px] text-slate-400 font-label text-right">${new Date(i.uploaded_at).toLocaleDateString('en-NG')}</p>
              </div>
            </div>`).join('')}
        </div>` : `
        <div class="bg-slate-50 rounded-xl p-6 text-center">
          <span class="material-symbols-outlined text-slate-300 text-3xl">inventory_2</span>
          <p class="text-sm text-slate-400 mt-2 font-label">No inventory uploaded yet</p>
        </div>`}

        <div class="border-t border-slate-100 mt-6"></div>
      </div>`).join('')
  } catch (e) { console.error(e) }
}

// ── Agents ────────────────────────────────────────────
async function loadAgents() {
  const status = document.getElementById('agent-status-filter').value
  const params = status ? `?status=${status}` : ''
  try {
    const data = await get(`${API}/agents${params}`)
    document.getElementById('agents-table').innerHTML = data.map(a => `
      <tr>
        <td>
          <p class="font-semibold text-sm">${a.name}</p>
          <p class="text-xs text-slate-400 mt-0.5">${a.email}</p>
        </td>
        <td class="text-sm">${a.phone}</td>
        <td>
          <p class="text-sm font-medium">${a.state || a.region || '—'}</p>
          ${a.lga ? `<p class="text-xs text-slate-400">${a.lga}</p>` : ''}
        </td>
        <td>${agentStatusBadge(a.status)}</td>
        <td>
          ${verifBadge(a.verification_status || 'unverified')}
          ${a.verification_status === 'pending' ? `<button class="btn btn-sm btn-p ml-1" onclick="navigate('verifications')">Review</button>` : ''}
        </td>
        <td>
          <div class="flex gap-2 flex-wrap">
            ${a.status !== 'active' ? `<button class="btn btn-sm btn-p" onclick="setAgentStatus('${a.id}','active')">Approve</button>` : ''}
            ${a.status !== 'suspended' ? `<button class="btn btn-sm btn-d" onclick="setAgentStatus('${a.id}','suspended')">Suspend</button>` : ''}
          </div>
        </td>
      </tr>`).join('') || '<tr><td colspan="6" class="text-center text-slate-400 py-8">No agents found</td></tr>'
  } catch (e) { console.error(e) }
}

async function setAgentStatus(id, status) {
  try {
    await patch(`${API}/agents/${id}`, { status })
    loadAgents()
  } catch (e) { alert(e.message) }
}

// ── Verifications ─────────────────────────────────────
async function loadVerifications() {
  const status = document.getElementById('verif-status-filter').value
  const params = status ? `?status=${status}` : ''
  try {
    const data = await get(`${API}/verifications${params}`)
    document.getElementById('verif-table').innerHTML = data.map(v => `
      <tr>
        <td>
          <p class="font-semibold text-sm">${v.agents?.name || '—'}</p>
          <p class="text-xs text-slate-400">${v.agents?.phone || ''}</p>
          <p class="text-xs text-slate-400">${v.agents?.state || ''}${v.agents?.lga ? ', ' + v.agents.lga : ''}</p>
        </td>
        <td class="text-sm">${docTypeLabel(v.doc_type)}</td>
        <td class="font-mono text-xs">${v.doc_number || '—'}</td>
        <td class="text-xs text-slate-500 max-w-[160px]">${v.id_address || v.agents?.state || '—'}</td>
        <td class="text-xs">${new Date(v.submitted_at).toLocaleDateString('en-NG')}</td>
        <td>${verifBadge(v.status)}</td>
        <td>
          <div class="flex gap-1.5 flex-wrap items-center">
            ${v.doc_url ? `<a href="${v.doc_url}" target="_blank" class="btn btn-sm" style="background:#f1f5f9;color:#1a1c1e;text-decoration:none;">View ID</a>` : ''}
            ${v.consent_form_url ? `<a href="${v.consent_form_url}" target="_blank" class="btn btn-sm" style="background:#f1f5f9;color:#1a1c1e;text-decoration:none;">Consent</a>` : ''}
            ${v.status === 'pending' ? `
              <button class="btn btn-sm btn-p" onclick="reviewVerif('${v.agent_id}','approved')">Approve</button>
              <button class="btn btn-sm btn-d" onclick="reviewVerif('${v.agent_id}','rejected')">Reject</button>
            ` : ''}
          </div>
        </td>
      </tr>`).join('') || '<tr><td colspan="7" class="text-center text-slate-400 py-8">No verifications found</td></tr>'
  } catch (e) { console.error(e) }
}

async function reviewVerif(agentId, status) {
  let rejection_reason = null
  if (status === 'rejected') {
    rejection_reason = prompt('Reason for rejection (optional):')
  }
  try {
    await patch(`${API}/verifications/${agentId}`, { status, rejection_reason })
    loadVerifications()
  } catch (e) { alert(e.message) }
}

function docTypeLabel(t) {
  const m = { nin:'NIN', drivers_licence:"Driver's Licence", passport:'Passport', voters_card:"Voter's Card" }
  return m[t] || t || '—'
}
function verifBadge(s) {
  const m = { pending:'badge-yellow', approved:'badge-green', rejected:'badge-red' }
  return `<span class="badge ${m[s]||'badge-gray'}">${s||'—'}</span>`
}

// ── Settings ──────────────────────────────────────────
async function loadSettings() {
  try {
    const data = await get(`${API}/settings`)
    document.getElementById('settings-list').innerHTML = data.map(s => `
      <div class="settings-row">
        <div>
          <label>${s.label || s.key}</label>
          <p>${s.key}</p>
        </div>
        <input class="settings-inp" type="text" value="${s.value}" onblur="saveSetting('${s.key}', this.value)" onkeydown="if(event.key==='Enter')this.blur()" />
      </div>`).join('')
  } catch (e) { console.error(e) }
}

async function saveSetting(key, value) {
  try {
    await patch(`${API}/settings/${key}`, { value })
  } catch (e) { alert('Failed to save: ' + e.message) }
}

// ── Payouts ───────────────────────────────────────────
async function loadPayouts() {
  const month = document.getElementById('payout-month').value
  try {
    const data = await get(`${API}/payouts?month=${month}`)
    document.getElementById('payouts-table').innerHTML = data.map(p => `
      <tr>
        <td>${p.name}</td>
        <td>${p.region || '—'}</td>
        <td>${p.upload_count}</td>
        <td>₦${p.rate}</td>
        <td>₦${Number(p.bonus).toLocaleString()}</td>
        <td style="font-weight:700;">₦${Number(p.total_amount).toLocaleString()}</td>
        <td>${payoutBadge(p.payout_status)}</td>
        <td>
          ${p.payout_status === 'pending' ? `<button class="btn btn-sm btn-primary" onclick="approvePayout('${p.agent_id}','${month}')">Approve</button>` : ''}
        </td>
      </tr>`).join('') || '<tr><td colspan="8" style="color:var(--muted); text-align:center;">No data</td></tr>'
  } catch (e) { console.error(e) }
}

async function approvePayout(agentId, month) {
  try {
    await post(`${API}/payouts/approve`, { agent_id: agentId, month })
    loadPayouts()
  } catch (e) { alert(e.message) }
}

// ── Helpers ───────────────────────────────────────────
function statusBadge(s) {
  return orderStatusPill(s)
}
function agentStatusBadge(s) {
  const map = { active: 'badge-green', pending: 'badge-yellow', suspended: 'badge-red' }
  return `<span class="badge ${map[s] || 'badge-gray'}">${s}</span>`
}
function payoutBadge(s) {
  const map = { pending: 'badge-yellow', approved: 'badge-blue', paid: 'badge-green' }
  return `<span class="badge ${map[s] || 'badge-gray'}">${s}</span>`
}

function renderPagination(elId, current, total, fn) {
  const el = document.getElementById(elId)
  el.innerHTML = ''
  for (let i = 1; i <= total; i++) {
    const btn = document.createElement('button')
    btn.textContent = i
    if (i === current) btn.classList.add('active')
    btn.onclick = () => fn(i)
    el.appendChild(btn)
  }
}

async function get(url) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${adminToken}` } })
  const data = await res.json()
  if (!res.ok) {
    if (res.status === 401) { adminLogout(); return }
    throw new Error(data.error || 'Request failed')
  }
  return data
}

async function post(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify(body)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

async function patch(url, body) {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify(body)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}
