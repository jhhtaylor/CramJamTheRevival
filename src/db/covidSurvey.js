const mongoose = require('mongoose')
const { Schema } = mongoose

// Group Schema
const covidSurvey = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'StudentProfile' },
  symptoms: {
    fever: Boolean,
    dryCough: Boolean,
    SoreThroat: Boolean,
    redEyes: Boolean,
    shortBreath: Boolean,
    bodyAches: Boolean,
    lossSmell: Boolean,
    nausea: Boolean,
    diarrhea: Boolean,
    fatigue: Boolean
  },
  exposure: {
    test: Boolean,
    exposed: Boolean
  }
})

module.exports.CovidSurvey = mongoose.model('CovidSurvey', covidSurvey)
