const mongoose = require('mongoose')
const { Schema } = mongoose

// Group Schema
const groupSchema = new Schema({
  name: { type: String, required: true },
  links: [{ type: Schema.Types.ObjectId, ref: 'Link' }],
  members: [{ type: Schema.Types.ObjectId, ref: 'StudentProfile' }],
  meetings: [{ type: Schema.Types.ObjectId, ref: 'Meeting' }],
  tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
  invites: [{ type: Schema.Types.ObjectId, ref: 'StudentProfile' }],
  polls: [{ type: Schema.Types.ObjectId, ref: 'Poll' }],
  description: { type: String }
})

module.exports.GroupSchema = mongoose.model('Group', groupSchema)
