const mongoose = require('mongoose')

const pharmacySchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  lga: String,
  state: String,
  phone: String,
  lat: Number,
  lng: Number,
  added_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
}, { timestamps: true })

module.exports = mongoose.model('Pharmacy', pharmacySchema)
