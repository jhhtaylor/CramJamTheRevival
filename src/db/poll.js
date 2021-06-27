const mongoose = require('mongoose')
const { Schema } = mongoose

const kickReasons = ['Disrespectful behaviour', 'Non participatory', 'Consistently late', 'Missed too many meetings', 'Posts inappropriate links', 'Does not share notes']

// Group Schema
const pollSchema = new Schema({
  name: { type: String, required: true },
  action: { type: String, enum: ['Remove', 'Add', 'Invite'], required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'StudentProfile' }],
  voted: [{ type: Schema.Types.ObjectId }],
  votes: { yes: { type: Number, default: 0 }, no: { type: Number, default: 0 } },
  group: { type: Schema.Types.ObjectId, ref: 'Group' },
  active: { type: Boolean, default: true, required: true },
  affected: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
  reason: { type: String, enum: ['', ...kickReasons] }
})

module.exports.Poll = mongoose.model('Poll', pollSchema)
module.exports.KickReasons = kickReasons
