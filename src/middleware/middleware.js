const Poll = require('../db/poll')

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash('error', 'You must be logged in')
    req.session.returnTo = req.originalUrl
    return res.redirect('/students/login')
  }
  next()
}

module.exports.isPartOfVote = (req, res, next) => {
  const { pollid } = req.params
  const poll = Poll.findOneById(pollid)
  if (!poll.members.contains(req.user._id)) {
    req.flash('error', 'You are not part of this vote')
    req.session.returnTo = req.originalUrl
    return res.redirect('/polls')
  }
  next()
}
