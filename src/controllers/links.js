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
  if (!url.startsWith('https://')) {
    url = 'https://' + url
  }

  const link = new LinkSchema({
    name: req.body.name,
    url: url,
    user: req.user
  })
  await link.save()
  res.redirect('/links')
}
