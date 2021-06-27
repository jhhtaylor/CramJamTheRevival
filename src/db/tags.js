const mongoose = require('mongoose')
const { Schema } = mongoose

// Group Schema
const tagSchema = new Schema({
  name: { type: String, required: true, unique: true },
  groups: [{ type: Schema.Types.ObjectId, ref: 'Group', unique: true }]
})

module.exports.Tag = mongoose.model('Tag', tagSchema)
