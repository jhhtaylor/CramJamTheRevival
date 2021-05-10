const { Poll } = require('../db/poll')

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash('error', 'You must be logged in')
    req.session.returnTo = req.originalUrl
    return res.redirect('/students/login')
  }
  next()
}

module.exports.isPartOfVote = async (req, res, next) => {
  const { poll } = req.params
  const check = await Poll.findById(poll)
  if (!check.members.includes(req.user._id)) {
    req.flash('error', 'You are not part of this vote')
    req.session.returnTo = req.originalUrl
    return res.redirect('/polls')
  }
  next()
}
