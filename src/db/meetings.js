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
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // formatted as longitude latitude
      required: true
    }
  }
})

module.exports.MeetingSchema = mongoose.model('Meeting', meetingSchema)
