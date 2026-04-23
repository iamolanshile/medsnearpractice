const mongoose = require('mongoose')

const inventorySchema = new mongoose.Schema({
  pharmacy_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
  agent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
  drug_name: { type: String, required: true },
  brand: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  expiry_date: Date,
  photo_url: String,
  is_available: { type: Boolean, default: true },
}, { timestamps: true })

inventorySchema.index({ drug_name: 'text', brand: 'text' })

module.exports = mongoose.model('Inventory', inventorySchema)
