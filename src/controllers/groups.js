const { GroupSchema } = require('../db/groups')
const { StudentProfile } = require('../db/studentProfiles')
const { Tag } = require('../db/tags')
const { Poll, KickReasons } = require('../db/poll')
// Public

module.exports.index = async (req, res) => {
  const userGroups = req.user.groups
  const groups = await GroupSchema.find({ _id: { $in: userGroups } }).populate('members')
  const randomGroups = await GroupSchema.find({ _id: { $nin: userGroups } }).populate('members')
  res.render('groups/index', { groups, randomGroups })
}

// temp function to view members to add to a group
module.exports.explore = async (req, res) => {
  const groupId = req.params.id
  // only display people who are not already in the group
  const group = await GroupSchema.findById(groupId).populate('polls')
  const groupPolls = group.polls
  const groupPollsAffected = groupPolls.map(poll => poll.affected)
  const students = await StudentProfile.find({
    _id: { $nin: groupPollsAffected },
    groups: { $nin: [groupId] },
    invites: { $nin: [groupId] },
    settings: { isSearchable: true }
  })
  res.render('groups/explore', { students: students, group: group })
}

module.exports.renderNewForm = async (req, res) => {
  const allTags = await Tag.find({})
  res.render('groups/new', { allTags })
}

module.exports.createGroup = async (req, res) => {
  const group = new GroupSchema({
    name: req.body.name,
    description: req.body.description
  })
  await group.save()
  req.body.group = group._id
  try {
    await this.editTags(req, res)
  } catch (err) {
    req.flash('error', err.message)
  }
  try {
    await this.addGroupMember(group._id, req.user._id, req)
  } catch (err) {
    req.flash('error', err.message)
    await this.deleteGroup(group._id)
  }
  req.flash('success', 'Created new group!')
  res.redirect(`/groups/${group._id}`)
}

module.exports.showGroup = async (req, res) => {
  const group = await GroupSchema.findById(req.params.id).populate(['members', 'invites', 'tags'])
  const polls = group.polls
  const groupPolls = await Poll.find({ _id: { $in: polls } }).populate(['affected', 'group'])
  const allTags = await Tag.find({})
  res.render('groups/show', { group, groupPolls, allTags, KickReasons })
}

module.exports.deleteGroup = async (groupId) => {
  const group = await GroupSchema.findById(groupId)
  const members = group.members
  await GroupSchema.findByIdAndDelete(groupId)
  await StudentProfile.updateMany({ _id: { $in: members } },
    { $pull: { groups: groupId } })
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
  await this.deleteMember(groupId, memberId)
  res.redirect('/groups')
}
module.exports.isInGroup = async (groupId, memberId) => {
  const group = await GroupSchema.findById(groupId).populate('polls')
  const isIn = group.members.includes(memberId)
  if (isIn === true) { return true }
  return false
}

module.exports.isInvited = async (groupId, memberId) => {
  const group = await GroupSchema.findById(groupId).populate('polls')
  const isInvited = group.invites.includes(memberId)
  if (isInvited === true) { return true }
  return false
}

module.exports.invite = async (groupId, memberId) => {
  await GroupSchema.updateOne({ _id: groupId },
    { $push: { invites: memberId } })
  await StudentProfile.updateOne({ _id: memberId },
    { $push: { invites: groupId } })
}

module.exports.inviteGroupMember = async (req, res) => {
  const groupId = req.params.id
  const memberId = req.params.member
  await this.invite(groupId, memberId)
  res.redirect(`/groups/${groupId}`)
}
module.exports.addGroupMember = async (groupId, memberId) => {
  const student = await StudentProfile.findById(memberId)
  student.groups.push(groupId)
  await student.save()
  await GroupSchema.updateOne({ _id: groupId },
    { $push: { members: memberId } })
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
  try {
    await this.addGroupMember(groupId, memberId)
    await this.removeInvite(groupId, memberId)
  } catch (err) {
    req.flash('error', err.message)
  }
  res.redirect(`/groups/${groupId}`)
}

module.exports.declineInvite = async (req, res) => {
  const groupId = req.params.id
  const memberId = req.user._id
  await this.removeInvite(groupId, memberId)
  res.redirect(`/groups/${groupId}`)
}

module.exports.editTags = async (req, res) => {
  const tagsStr = req.body.tags
  const tags = tagsStr.split(',')
  const group = await GroupSchema.findById(req.body.group).populate('tags')
  const allTags = await Tag.find({})

  // Clear the group's current tags if it has any
  if (group.tags.length > 0) {
    group.tags = []
    await group.save()
  }

  for (const tag of tags) {
    if (!allTags.some(t => t.name === tag)) {
      const newTag = new Tag({
        name: tag,
        groups: [group._id]
      })
      await newTag.save()
      group.tags.push(newTag._id)
      await group.save()
    } else {
      const foundTag = await Tag.findOne({ name: String(tag) })
      foundTag.groups.push(group._id)
      foundTag.save()
      group.tags.push(foundTag._id)
      await group.save()
    }
  }
}
