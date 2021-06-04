const { GroupSchema } = require('../db/groups')
const { StudentProfile } = require('../db/studentProfiles')
const { Poll } = require('../db/poll')
// Public

module.exports.index = async (req, res) => {
  const userGroups = req.user.groups
  const groups = await GroupSchema.find({ _id: { $in: userGroups } }).populate('members')
  const randomGroup = await GroupSchema.findOne({ _id: { $nin: userGroups } }).populate('members')
  res.render('groups/index', { groups, randomGroup })
}

// temp function to view members to add to a group
module.exports.explore = async (req, res) => {
  const groupId = req.params.id
  // only display people who are not already in the group
  const students = await StudentProfile.find({})
  const group = await GroupSchema.findById(groupId)
  res.render('groups/explore', { students: students, group: group })
}

module.exports.renderNewForm = (req, res) => {
  res.render('groups/new')
}

module.exports.createGroup = async (req, res, next) => {
  const group = new GroupSchema({
    name: req.body.name
  })
  await group.save()
  if (req.user._id !== undefined) {
    group.members.push(req.user._id)
    await group.save()
    const user = await StudentProfile.findById(req.user._id)
    user.groups.push(group._id)
    await user.save()
  }
  // req.flash('success', 'Created new group!')
  res.redirect('/groups/')
}
module.exports.showGroup = async (req, res) => {
  const group = await GroupSchema.findById(req.params.id).populate(['members', 'invites'])
  const polls = group.polls
  const groupPolls = await Poll.find({ _id: { $in: polls } }).populate(['affected', 'group'])

  if (!group) {
    // req.flash('error', 'Cannot find that group!')
    return res.redirect('/groups')
  }
  res.render('groups/show', { group, groupPolls })
}

module.exports.deleteGroup = async (req, res) => {
  const { id } = req.params
  const group = await GroupSchema.findById(id)
  const members = group.members
  await GroupSchema.findByIdAndDelete(id)
  await StudentProfile.updateMany({ _id: { $in: members } },
    { $pull: { groups: id } })
  res.redirect('/groups')
}

module.exports.deleteMember = async (groupId, memberId) => {
  const group = await GroupSchema.findById(groupId)
  await StudentProfile.updateOne({ _id: memberId },
    { $pull: { groups: groupId } })
  if (group.members.length === 1) {
    await GroupSchema.deleteOne({ _id: groupId })
    return true
  } else {
    await GroupSchema.updateOne({ _id: groupId },
      { $pull: { members: memberId } })
    return false
  }
}

module.exports.deleteGroupMember = async (req, res) => {
  const groupId = req.params.id
  const memberId = req.params.member
  const empty = await this.deleteMember(groupId, memberId)
  if (!empty) {
    console.log('not empty')
    res.redirect('/groups')
  } else {
    console.log('empty')
    res.redirect('/groups')
  }
}
module.exports.isInGroup = async (groupId, memberId) => {
  const exists = GroupSchema.find({
    _id: groupId,
    members: { $in: [memberId] }
  }).count()
  if (exists) return true
  return false
}

module.exports.invite = async (groupId, memberId) => {
  const exists = GroupSchema.find({
    _id: groupId,
    members: { $in: [memberId] }
  }).count()

  if (!exists) {
    await GroupSchema.updateOne({ _id: groupId },
      { $push: { invites: memberId } })
    await StudentProfile.updateOne({ _id: memberId },
      { $push: { invites: groupId } })
  } else {
    console.log('nope')
  }
}

module.exports.inviteGroupMember = async (req, res) => {
  const groupId = req.params.id
  const memberId = req.params.member
  this.invite(groupId, memberId)
  res.redirect(`/groups/${groupId}`)
}
module.exports.addGroupMember = async (groupId, memberId) => {
  await GroupSchema.updateOne({ _id: groupId },
    { $push: { members: memberId } })
  await StudentProfile.updateOne({ _id: memberId },
    { $push: { groups: groupId } })
}

module.exports.removeInvite = async (groupId, memberId) => {
  await GroupSchema.updateOne({ _id: groupId },
    { $pull: { invites: memberId } })
  await StudentProfile.updateOne({ _id: memberId },
    { $pull: { invites: groupId } })
}

module.exports.acceptInvite = async (req, res) => {
  const groupId = req.params.id
  const memberId = req.user._id
  this.addGroupMember(groupId, memberId)
  this.removeInvite(groupId, memberId)
  res.redirect(`/groups/${groupId}`)
}

module.exports.declineInvite = async (req, res) => {
  const groupId = req.params.id
  const memberId = req.user._id
  this.removeInvite(groupId, memberId)
  res.redirect(`/groups/${groupId}`)
}
