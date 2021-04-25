const mongoose = require('mongoose')
const { Schema } = mongoose

// Group Schema
const groupSchema = new Schema({
  name: { type: String, required: true },
  links: { type: String },
  members: [{ type: Schema.Types.ObjectId, ref: 'Profiles' }],
  meetings: [{ type: Schema.Types.ObjectId, ref: 'Meetings' }]
})

module.exports.GroupSchema = mongoose.model('Group', groupSchema)