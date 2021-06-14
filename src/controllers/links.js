const { LinkSchema } = require('../db/links')

module.exports.index = async (req, res) => {
  const links = await LinkSchema.find().populate('user')
  res.render('links/index', { linkItems: links })
}

module.exports.renderNewForm = async (req, res) => {
  res.render('links/new.ejs')
}

module.exports.createLink = async (req, res) => {
  // ensure all links work
  let url = req.body.url

  // Next: Should re-prompt user to enter link again
  if (!isValidHttpUrl(url)) {
    url = '/links' // take user back to links page if link url is not valid
    req.flash('error', 'You have just added an invalid link') // inform the user of their mistake
  }

  const link = new LinkSchema({
    name: req.body.name,
    url: url,
    user: req.user
  })
  await link.save()
  res.redirect('/links')
}

// should I put this function in it's own file? In utils/linkUtils.js?
function isValidHttpUrl(string) {
  let url

  try {
    url = new URL(string)
  } catch (_) {
    return false
  }

  return url.protocol === 'http:' || url.protocol === 'https:'
}
