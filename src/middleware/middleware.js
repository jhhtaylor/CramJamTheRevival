const { ActivityLog } = require('../db/activityLog')
const { Poll } = require('../db/poll')

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash('error', 'You must be logged in')
    req.session.returnTo = req.originalUrl
    return res.redirect('/students/login')
  }
  next()
}

module.exports.isAdmin = (req, res, next) => {
  if (!req.isAuthenticated() || !req.user.isAdmin) {
    req.flash('error', 'This is only available to admins')
    return res.redirect('/')
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

module.exports.logActivity = async (req, res, next) => {
  const user = { _id: null, username: 'not logged in' }
  if (req.user) {
    user._id = req.user._id
    user.username = req.user.username
  }
  const newLog = new ActivityLog({
    userid: user._id,
    username: user.username,
    route: `${req.baseUrl}${req.path}`,
    method: req.method,
    date: new Date()
  })
  await newLog.save()
  next()
}
