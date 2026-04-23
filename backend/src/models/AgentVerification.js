const mongoose = require('mongoose')

const agentVerificationSchema = new mongoose.Schema({
  agent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true, unique: true },
  doc_type: { type: String, required: true },
  doc_number: { type: String, required: true },
  doc_url: String,
  id_address: String,
  consent_form_url: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejection_reason: String,
  reviewed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  reviewed_at: Date,
}, { timestamps: true })

module.exports = mongoose.model('AgentVerification', agentVerificationSchema)
