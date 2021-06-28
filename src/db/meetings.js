const mongoose = require('mongoose')
const { Schema } = mongoose

// Meetings Schema
const meetingSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  group: { type: Schema.ObjectId, ref: 'Group', required: true },
  attendees: [{ type: Schema.Types.ObjectId, ref: 'StudentProfile' }],
  location: { // formatted accoring to https://mongoosejs.com/docs/geojson.html
    type: {
      type: String,
      enum: ['Point', 'Online'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true// formatted as longitude latitude
    }
  },
  start: {
    type: Date,
    required: true
  },
  end: {
    type: Date,
    required: true
  }
})

module.exports.MeetingSchema = mongoose.model('Meeting', meetingSchema)
