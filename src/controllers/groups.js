const { GroupSchema } = require('../db/groups')
// Public

module.exports.index = async (req, res) => {
  const groups = await GroupSchema.find({})
  res.render('groups/index', { groups })
}

module.exports.renderNewForm = (req, res) => {
  res.render('groups/new')
}

module.exports.createGroup = async (req, res, next) => {
  const group = new GroupSchema({
    name: req.body.name
  })
  // group.members = [req.user._id]
  await group.save()
  console.log(group)
  // req.flash('success', 'Successfully made a new group!')
  res.redirect('/groups/')
}

module.exports.deleteGroup = async (req, res) => {
  const { id } = req.params
  await GroupSchema.findByIdAndDelete(id)
  res.redirect('/groups')
}
