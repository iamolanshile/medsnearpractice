const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  customer_phone: { type: String, required: true },
  customer_name: String,
  drug_name: { type: String, required: true },
  pharmacy_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy' },
  agent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
  quantity: { type: Number, default: 1 },
  total_price: Number,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'delivered', 'cancelled'],
    default: 'pending'
  },
  payment_confirmed: { type: Boolean, default: false },
  payment_reference: String,
  delivery_address: String,
  notes: String,
}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)
