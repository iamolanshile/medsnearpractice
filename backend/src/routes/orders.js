const express = require('express')
const fs = require('fs')
const path = require('path')
const Order = require('../models/Order')

const router = express.Router()

router.post('/', async (req, res) => {
  try {
    const {
      customer_name,
      customer_phone,
      drug_name,
      quantity,
      total_price,
      delivery_address,
      notes,
    } = req.body

    if (!customer_name || !customer_phone || !drug_name || quantity === undefined || total_price === undefined) {
      return res.status(400).json({ error: 'Missing required order fields' })
    }

    const order = await Order.create({
      customer_name,
      customer_phone,
      drug_name,
      quantity,
      total_price,
      delivery_address,
      notes,
      status: 'pending',
      payment_confirmed: false,
    })

    res.status(201).json(order)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.get('/', async (req, res) => {
  try {
    const { customer_phone, customer_name, status, page = 1, limit = 50 } = req.query
    const filter = {}
    if (customer_phone) filter.customer_phone = customer_phone
    if (customer_name) filter.customer_name = { $regex: new RegExp(customer_name, 'i') }
    if (status) filter.status = status

    const pageNumber = Math.max(1, parseInt(page, 10))
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)))

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)

    res.json(orders)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.json(order)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.patch('/:id', async (req, res) => {
  try {
    const { payment_confirmed, payment_reference, status } = req.body
    const updates = {}

    if (payment_confirmed !== undefined) {
      updates.payment_confirmed = payment_confirmed === 'true' || payment_confirmed === true
    }
    if (payment_reference !== undefined) updates.payment_reference = payment_reference
    if (status) updates.status = status

    const proofFile = req.files?.proof || req.files?.paymentProof
    if (proofFile) {
      const uploadsFolder = path.join(__dirname, '../../uploads/payment-proofs')
      await fs.promises.mkdir(uploadsFolder, { recursive: true })
      const safeName = proofFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const storedName = `${Date.now()}-${safeName}`
      const savedPath = path.join(uploadsFolder, storedName)

      await proofFile.mv(savedPath)

      updates.payment_proof = {
        filename: storedName,
        original_name: proofFile.name,
        mime_type: proofFile.mimetype,
        size: proofFile.size,
        path: `/uploads/payment-proofs/${storedName}`,
        uploaded_at: new Date(),
      }

      if (payment_reference === undefined) updates.payment_reference = proofFile.name
      if (payment_confirmed === undefined) updates.payment_confirmed = true
      if (!status) updates.status = 'confirmed'
    }

    const order = await Order.findByIdAndUpdate(req.params.id, updates, { new: true })
    if (!order) return res.status(404).json({ error: 'Order not found' })

    res.json(order)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
