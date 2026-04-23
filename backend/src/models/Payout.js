const mongoose = require('mongoose')

const payoutSchema = new mongoose.Schema({
  agent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
  month: { type: String, required: true }, // e.g. "2025-04"
  upload_count: { type: Number, default: 0 },
  rate_per_upload: { type: Number, default: 150 },
  bonus: { type: Number, default: 0 },
  total_amount: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'approved', 'paid'], default: 'pending' },
  approved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  paid_at: Date,
}, { timestamps: true })

payoutSchema.index({ agent_id: 1, month: 1 }, { unique: true })

module.exports = mongoose.model('Payout', payoutSchema)
