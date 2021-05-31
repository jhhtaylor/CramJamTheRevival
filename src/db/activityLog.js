const mongoose = require('mongoose')
const { Schema } = mongoose

// Group Schema
const activitySchema = new Schema({
  username: { type: String },
  userid: { type: Schema.Types.ObjectId, ref: 'StudentProfile' },
  route: { type: String },
  method: { type: String },
  date: { type: Date }
})

module.exports.ActivityLog = mongoose.model('ActivityLog', activitySchema)
