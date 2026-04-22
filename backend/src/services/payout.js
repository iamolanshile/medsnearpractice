const supabase = require('../lib/supabase')

async function calculatePayout(month) {
  const start = `${month}-01`
  const [y, m] = month.split('-').map(Number)
  const nextM = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`

  const { data: agents } = await supabase
    .from('agents')
    .select('id, name, phone, region')
    .eq('status', 'active')

  if (!agents) return []

  const rate = parseFloat(process.env.PAYOUT_RATE_PER_UPLOAD || 50)

  const results = await Promise.all(agents.map(async (agent) => {
    const { count } = await supabase
      .from('inventory')
      .select('*', { count: 'exact', head: true })
      .eq('agent_id', agent.id)
      .gte('uploaded_at', start)
      .lt('uploaded_at', nextM)

    const bonus = count >= 100 ? 2000 : count >= 50 ? 1000 : 0
    const total = count * rate + bonus

    // Check existing payout record
    const { data: existing } = await supabase
      .from('payouts')
      .select('status')
      .eq('agent_id', agent.id)
      .eq('month', month)
      .single()

    return {
      agent_id: agent.id,
      name: agent.name,
      phone: agent.phone,
      region: agent.region,
      upload_count: count,
      rate,
      bonus,
      total_amount: total,
      payout_status: existing?.status || 'pending'
    }
  }))

  return results.sort((a, b) => b.upload_count - a.upload_count)
}

module.exports = { calculatePayout }
