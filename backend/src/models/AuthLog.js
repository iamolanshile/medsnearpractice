const mongoose = require('mongoose')

const authLogSchema = new mongoose.Schema({
  user_type: {
    type: String,
    enum: ['agent', 'admin', 'customer', 'system'],
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  email: {
    type: String,
    lowercase: true,
  },
  action: {
    type: String,
    enum: ['login', 'register', 'logout', 'token_refresh', 'auth_failure'],
    required: true,
  },
  status: {
    type: String,
    enum: ['success', 'failure'],
    required: true,
  },
  ip: String,
  user_agent: String,
  message: String,
}, {
  timestamps: true,
})

module.exports = mongoose.model('AuthLog', authLogSchema)
