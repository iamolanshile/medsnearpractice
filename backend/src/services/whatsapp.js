const supabase = require('../lib/supabase')
const { searchDrugNearby } = require('./inventory')

// In-memory session store (replace with Redis/Supabase for production)
const sessions = {}

const STATES = {
  IDLE: 'idle',
  AWAITING_LOCATION: 'awaiting_location',
  AWAITING_DRUG: 'awaiting_drug',
  SHOWING_RESULTS: 'showing_results',
  AWAITING_SELECTION: 'awaiting_selection',
  AWAITING_NAME: 'awaiting_name',
  AWAITING_ADDRESS: 'awaiting_address',
  AWAITING_PAYMENT: 'awaiting_payment',
  ORDER_PLACED: 'order_placed'
}

function getSession(phone) {
  if (!sessions[phone]) {
    sessions[phone] = { state: STATES.IDLE, data: {} }
  }
  return sessions[phone]
}

function clearSession(phone) {
  sessions[phone] = { state: STATES.IDLE, data: {} }
}

async function handleMessage(phone, messageBody, locationData = null) {
  const session = getSession(phone)
  const msg = messageBody?.trim()

  // Global reset
  if (['hi', 'hello', 'start', 'menu', 'restart'].includes(msg?.toLowerCase())) {
    clearSession(phone)
    return {
      reply: `👋 Welcome to *MedsNear*!\n\nI help you find medications at nearby pharmacies.\n\nPlease share your *location* 📍 so I can find pharmacies near you.\n\n_(Tap the 📎 icon → Location)_`,
      state: STATES.AWAITING_LOCATION
    }
  }

  switch (session.state) {
    case STATES.IDLE:
    case STATES.AWAITING_LOCATION: {
      if (locationData?.latitude) {
        session.data.lat = locationData.latitude
        session.data.lng = locationData.longitude
        session.state = STATES.AWAITING_DRUG
        return { reply: `📍 Got your location!\n\nWhat medication are you looking for? Type the drug name:` }
      }
      return {
        reply: `👋 Welcome to *MedsNear*!\n\nPlease share your *location* 📍 to get started.\n\n_(Tap the 📎 icon → Location)_`,
        state: STATES.AWAITING_LOCATION
      }
    }

    case STATES.AWAITING_DRUG: {
      if (!msg) return { reply: 'Please type the name of the medication you need.' }

      session.data.drugQuery = msg
      const results = await searchDrugNearby(msg, session.data.lat, session.data.lng)

      if (!results.length) {
        return {
          reply: `😔 Sorry, I couldn't find *${msg}* at any nearby pharmacies right now.\n\nTry a different name or check back later.\n\nType another drug name or "menu" to restart.`
        }
      }

      session.data.results = results
      session.state = STATES.AWAITING_SELECTION

      let replyText = `✅ Found *${msg}* at ${results.length} nearby pharmacies:\n\n`
      results.forEach((r, i) => {
        const pharmacy = r.pharmacies || r
        replyText += `*${i + 1}.* ${pharmacy.name || r.pharmacy_name}\n`
        replyText += `   📍 ${pharmacy.address || r.address}\n`
        replyText += `   💊 ${r.drug_name} — ₦${Number(r.price).toLocaleString()}\n`
        replyText += `   📦 ${r.quantity} in stock\n\n`
      })
      replyText += `Reply with a number (1-${results.length}) to order, or type another drug name.`

      return { reply: replyText }
    }

    case STATES.AWAITING_SELECTION: {
      const choice = parseInt(msg)
      if (isNaN(choice) || choice < 1 || choice > session.data.results.length) {
        // Maybe they typed a new drug name
        if (msg && msg.length > 1) {
          session.state = STATES.AWAITING_DRUG
          return handleMessage(phone, msg)
        }
        return { reply: `Please reply with a number between 1 and ${session.data.results.length}.` }
      }

      session.data.selectedItem = session.data.results[choice - 1]
      session.state = STATES.AWAITING_NAME
      return { reply: `Great choice! What's your name?` }
    }

    case STATES.AWAITING_NAME: {
      session.data.customerName = msg
      session.state = STATES.AWAITING_ADDRESS
      return { reply: `Thanks ${msg}! What's your delivery address?` }
    }

    case STATES.AWAITING_ADDRESS: {
      session.data.deliveryAddress = msg
      const item = session.data.selectedItem
      const pharmacy = item.pharmacies || item
      const total = item.price * 1 // qty 1 for now

      session.state = STATES.AWAITING_PAYMENT

      return {
        reply: `📋 *Order Summary*\n\n` +
          `Drug: ${item.drug_name}\n` +
          `Pharmacy: ${pharmacy.name || item.pharmacy_name}\n` +
          `Price: ₦${Number(item.price).toLocaleString()}\n` +
          `Delivery to: ${msg}\n\n` +
          `💳 *Payment Details*\n` +
          `Bank: ${process.env.COMPANY_BANK_NAME}\n` +
          `Account: ${process.env.COMPANY_ACCOUNT_NUMBER}\n` +
          `Name: ${process.env.COMPANY_ACCOUNT_NAME}\n` +
          `Amount: ₦${Number(total).toLocaleString()}\n\n` +
          `After payment, reply *PAID* to confirm your order.`
      }
    }

    case STATES.AWAITING_PAYMENT: {
      if (msg?.toUpperCase() === 'PAID') {
        const item = session.data.selectedItem
        const pharmacy = item.pharmacies || item

        // Create order in DB
        const { data: order, error } = await supabase
          .from('orders')
          .insert({
            inventory_id: item.id,
            pharmacy_id: item.pharmacy_id || pharmacy.id,
            agent_id: item.agent_id,
            customer_phone: phone,
            customer_name: session.data.customerName,
            drug_name: item.drug_name,
            quantity: 1,
            total_price: item.price,
            delivery_address: session.data.deliveryAddress,
            status: 'confirmed',
            payment_confirmed: false // admin verifies manually
          })
          .select()
          .single()

        if (error) {
          return { reply: `Something went wrong placing your order. Please try again or contact support.` }
        }

        clearSession(phone)
        return {
          reply: `✅ *Order Confirmed!*\n\nOrder ID: #${order.id.slice(0, 8).toUpperCase()}\n\nOur team will verify your payment and assign a delivery agent shortly.\n\nYou'll receive an update here on WhatsApp.\n\nThank you for using MedsNear! 💊`
        }
      }

      return {
        reply: `Please make the payment and reply *PAID* to confirm.\n\nOr type "menu" to start over.`
      }
    }

    default:
      clearSession(phone)
      return { reply: `Type "hi" to get started.` }
  }
}

module.exports = { handleMessage }
