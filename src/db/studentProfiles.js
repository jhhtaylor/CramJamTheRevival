const mongoose = require('mongoose')
const localMongoose = require('passport-local-mongoose')
const { Schema } = mongoose
const MAX_GROUPS = 10

// Student Profile Schema
const studentProfileSchema = new Schema({
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  groups: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'Group'
    }],
    validate: {
      validator: function (v) {
        return v.length <= MAX_GROUPS
      },
      message: props => 'Group limit reached!'
    }
  },
  invites: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
  polls: [{ type: Schema.Types.ObjectId, ref: 'Poll' }],
  location: { type: String, required: true }, // string location name eg Wits
  geodata: {
    // actual geographic data such as longitude latitude
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  rating: [
    {
      rated: { type: Number },
      rater: { type: Schema.Types.ObjectId, ref: 'StudentProfile' }
    }
  ],
  isAdmin: { type: Boolean, default: false },
  settings: {
    isSearchable: { type: Boolean, default: true }
  }
})

studentProfileSchema.virtual('averageRating').get(function () {
  let avg = 0
  for (const rate of this.rating) {
    avg += rate.rated
  }
  avg /= this.rating.length
  return avg
})
studentProfileSchema.plugin(localMongoose)

module.exports.StudentProfile = mongoose.model(
  'StudentProfile',
  studentProfileSchema
)
