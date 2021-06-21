const mongoose = require('mongoose')
const { Schema } = mongoose

// Link Schema
const linkSchema = new Schema({
  name: { type: String },
  notes: { type: String },
  url: { type: String },
  user: { type: Schema.Types.ObjectId, ref: 'StudentProfile' },
  group: { type: Schema.Types.ObjectId, ref: 'Group' }
})

module.exports.LinkSchema = mongoose.model('Link', linkSchema)
