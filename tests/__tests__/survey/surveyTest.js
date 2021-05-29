const survey = require('../../../src/controllers/survey')
const { CovidSurvey } = require('../../../src/db/covidSurvey')
const { dbConnect, dbDisconnect, checkNotEmpty, checkStringEquals } = require('../../../utils/testUtils/dbTestUtils')
const Mongoose = require('mongoose')

beforeAll(async () => { dbConnect() })
afterAll(async () => { dbDisconnect() })

describe('Survey controller test suite', () => {
  test('should be able to take a test', async () => {
    const testSurvey = {
      symptoms: {
        fever: false,
        dryCough: false,
        SoreThroat: false,
        redEyes: false,
        shortBreath: false,
        bodyAches: false,
        lossSmell: false,
        nausea: false,
        diarrhea: false,
        fatigue: false
      },
      exposure: {
        test: false,
        exposed: false
      }
    }
    const user = { _id: Mongoose.Types.ObjectId() }
    const req = { user, flash: (str1, str2) => {}, body: { symptoms: testSurvey.symptoms, exposure: testSurvey.exposure } }
    const res = { redirect: () => {} }
    await survey.takeSurvey(req, res)
    const foundSurvey = CovidSurvey.findOne({})
    checkNotEmpty(foundSurvey)
  })
  test('should get view', async () => {
    const check = 'survey/takeSurvey'
    const res = { render: (str1) => { checkStringEquals(check, str1) } }
    survey.showSurvey({}, res)
  })
})
