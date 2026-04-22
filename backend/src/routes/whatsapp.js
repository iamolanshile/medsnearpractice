const express = require('express')
const { handleMessage } = require('../services/whatsapp')

const router = express.Router()

// Twilio WhatsApp webhook
router.post('/webhook', async (req, res) => {
  const body = req.body

  // Twilio sends form-encoded data
  const from = body.From?.replace('whatsapp:', '') || body.from
  const messageBody = body.Body || body.body || ''

  // Location from Twilio (sent as Latitude/Longitude params)
  let locationData = null
  if (body.Latitude && body.Longitude) {
    locationData = {
      latitude: parseFloat(body.Latitude),
      longitude: parseFloat(body.Longitude)
    }
  }

  // 360dialog sends JSON
  if (body.messages) {
    const msg = body.messages[0]
    const phone = msg.from
    const text = msg.type === 'text' ? msg.text?.body : ''
    const loc = msg.type === 'location' ? { latitude: msg.location.latitude, longitude: msg.location.longitude } : null

    const result = await handleMessage(phone, text, loc)
    return res.json({
      messaging_product: 'whatsapp',
      to: phone,
      type: 'text',
      text: { body: result.reply }
    })
  }

  const result = await handleMessage(from, messageBody, locationData)

  // Respond in TwiML format for Twilio
  res.set('Content-Type', 'text/xml')
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(result.reply)}</Message>
</Response>`)
})

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

module.exports = router
