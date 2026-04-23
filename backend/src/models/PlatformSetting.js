const mongoose = require('mongoose')

const platformSettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true },
  label: String,
  description: String,
}, { timestamps: true })

module.exports = mongoose.model('PlatformSetting', platformSettingSchema)
