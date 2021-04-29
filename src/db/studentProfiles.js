const mongoose = require('mongoose')
const localMongoose = require('passport-local-mongoose')
const { Schema } = mongoose

// Student Profile Schema
const studentProfileSchema = new Schema({
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  groups: [{ type: Schema.Types.ObjectId, ref: 'Group' }]
})

studentProfileSchema.plugin(localMongoose)

module.exports.StudentProfile = mongoose.model('StudentProfile', studentProfileSchema)
