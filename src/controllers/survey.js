const { CovidSurvey } = require('../db/covidSurvey')

module.exports.takeSurvey = async (req, res) => {
  const { symptoms, exposure } = req.body
  const newSurvey = new CovidSurvey({
    student: req.user._id,
    symptoms,
    exposure
  })
  await newSurvey.save()
  req.flash('success', 'Covid Survey Taken')
  res.redirect('/')
}

module.exports.showSurvey = (req, res) => {
  res.render('survey/takeSurvey')
}
