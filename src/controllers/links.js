const { LinkSchema } = require('../db/links')

module.exports.index = async (req, res) => {
  const links = await LinkSchema.find()
  res.render('links/index', { linkItems: links })
}

module.exports.renderNewForm = async (req, res) => {
  res.render('links/new.ejs')
}

module.exports.createLink = async (req, res) => {
  const link = new LinkSchema({
    name: req.body.name,
    url: req.body.url
  })
  await link.save()

  res.redirect('/links')
}
