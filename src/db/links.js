const mongoose = require('mongoose')
const { Schema } = mongoose

// Link Schema
const linkSchema = new Schema({
  name: { type: String, required: true },
  url: { type: String, required: true }
})

module.exports.LinkSchema = mongoose.model('Link', linkSchema)
