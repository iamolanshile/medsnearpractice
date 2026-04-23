const mongoose = require('mongoose')

const agentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  password_hash: { type: String, required: true },
  state: { type: String, required: true },
  lga: { type: String, required: true },
  region: String,
  id_address: String,
  status: { type: String, enum: ['pending', 'active', 'suspended'], default: 'pending' },
  verification_status: { type: String, enum: ['not_submitted', 'pending', 'verified', 'rejected'], default: 'not_submitted' },
}, { timestamps: true })

module.exports = mongoose.model('Agent', agentSchema)
