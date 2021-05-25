module.exports.takeSurvey = async (req, res) => {
  const { symptoms, exposure } = req.body
  console.log(symptoms, exposure)
  res.redirect('/survey')
}

module.exports.showSurvey = (req, res) => {
  res.render('survey/takeSurvey')
}
