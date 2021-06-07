const mongoose = require('mongoose')
const { Schema } = mongoose

// Group Schema
const groupSchema = new Schema({
  name: { type: String, required: true },
  links: { type: String },
  members: [{ type: Schema.Types.ObjectId, ref: 'StudentProfile' }],
  meetings: [{ type: Schema.Types.ObjectId, ref: 'Meeting' }],
  tags: [{ type: String }],
  invites: [{ type: Schema.Types.ObjectId, ref: 'StudentProfile' }],
  polls: [{ type: Schema.Types.ObjectId, ref: 'Poll' }]
})

module.exports.GroupSchema = mongoose.model('Group', groupSchema)
