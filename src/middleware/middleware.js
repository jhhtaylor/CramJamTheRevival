module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash('error', 'You must be logged in')
    req.session.returnTo = req.originalUrl
    return res.redirect('/students/login')
  }
  next()
}

