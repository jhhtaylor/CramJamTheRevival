const mongoose = require('mongoose')
const { Schema } = mongoose

// Group Schema
const covidSurvey = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'StudentProfile' },
  symptoms: {
    fever: Boolean,
    dryCough: Boolean,
    soreThroat: Boolean,
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
  },
  testDate: { type: Date }
})

covidSurvey.virtual('covidSafe').get(function () {
  return !this.symptoms.fever && !this.symptoms.soreThroat && !this.symptoms.redEyes && !this.symptoms.shortBreath && !this.symptoms.bodyAches && !this.symptoms.lossSmell && !this.symptoms.nausea && !this.symptoms.diarrhea && !this.symptoms.fatigue && !this.exposure.test && !this.symptoms.exposed
})

covidSurvey.virtual('currentTest').get(function () {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return this.testDate > startOfToday
})

module.exports.CovidSurvey = mongoose.model('CovidSurvey', covidSurvey)
