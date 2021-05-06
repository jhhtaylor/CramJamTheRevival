const { GroupSchema } = require('../db/groups')
const { StudentProfile } = require('../db/studentProfiles')
// Public

module.exports.index = async (req, res) => {
  const userGroups = req.user.groups
  const groups = await GroupSchema.find({ _id: { $in: userGroups } })
  res.render('groups/index', { groups })
}

module.exports.renderNewForm = (req, res) => {
  res.render('groups/new')
}

module.exports.createGroup = async (req, res, next) => {
  const group = new GroupSchema({
    name: req.body.name,
    members: [req.user._id]
  })
  // group.members = [req.user._id]
  await group.save()
  const user = await StudentProfile.findById(req.user._id)
  user.groups.push(group._id)
  await user.save()
  req.flash('success', 'Created new group!')
  res.redirect('/groups/')
}
module.exports.showGroup = async (req, res) => {
  const group = await GroupSchema.findById(req.params.id)
  if (!group) {
    // req.flash('error', 'Cannot find that group!')
    return res.redirect('/groups')
  }
  res.render('groups/show', { group })
}

module.exports.deleteGroup = async (req, res) => {
  const { id } = req.params
  await GroupSchema.findByIdAndDelete(id)
  res.redirect('/groups')
}

module.exports.deleteGroupMember = async (req, res) => {
  const id = req.params.id
  const member = req.params.member
  await GroupSchema.updateOne({ _id: id },
    { $pull: { members: member } })
  res.redirect('/groups')
}
