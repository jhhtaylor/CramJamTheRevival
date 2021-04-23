const mongoose = require('mongoose')
const { Schema } = mongoose

// Student Profile Schema
const studentProfileSchema = new Schema({
  email: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  password: { type: String },
  groups: [{ type: Schema.Types.ObjectId, ref: 'Group' }]
})

module.exports.StudentProfile = mongoose.model('StudentProfile', studentProfileSchema)
