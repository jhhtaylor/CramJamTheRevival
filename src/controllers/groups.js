const { GroupSchema } = require('../db/groups')
const { StudentProfile } = require('../db/studentProfiles')
const { Tag } = require('../db/tags')
const { Poll, KickReasons } = require('../db/poll')
const pollControl = require('./poll')
const { covidCheck } = require('./meetings')
// Public

module.exports.index = async (req, res) => {
  const userGroups = req.user.groups
  const maxGroupsToShow = 9
  const groups = await GroupSchema.find({ _id: { $in: userGroups } }).populate(['members', 'tags'])
  let relevantGroups = await this.getRecommendedGroups(req.user._id, maxGroupsToShow)
  if (!relevantGroups || relevantGroups.length === 0) {
    relevantGroups = await GroupSchema.find({}).populate(['members', 'polls', 'tags'])
    if (relevantGroups.length > maxGroupsToShow) relevantGroups = relevantGroups.slice(0, maxGroupsToShow)
  }
  res.render('groups/index', { groups, relevantGroups })
}

module.exports.getRecommendedGroups = async (userid, maxGroupsToShow) => {
  const tags = {} // all the tags for a person
  const user = await StudentProfile.findById(userid).populate('groups') // get the user in full
  if (!user.groups || user.groups.length === 0) return null //  if the users groups has no groups recommend anything
  for (const group of user.groups) {
    for (const tag of group.tags) {
      if (`${tag._id}` in tags) tags[`${tag._id}`] += 1 // increment tag occorrence
      else tags[`${tag._id}`] = 1 // if the first occurence, set occurrence to 1
    }
  }
  // remapping to be an array for easier access
  const items = Object.keys(tags).map(function (key) {
    return [key, tags[key]]
  })

  if (!items || items.length === 0) return null // if the users groups has no tags recommend anything

  let relevantGroups = [] // all the relevant groups
  // loop through tags
  for (const tag of items) {
    // get all groups with these tags
    const docs = await GroupSchema.find({ tags: { $in: tag[0] }, members: { $nin: user._id } }).populate(['members', 'polls', 'tags'])
    for (const doc of docs) {
      const check = relevantGroups.some(e => { return String(e._id) == String(doc._id) })
      if (!check) relevantGroups.push(doc) // if the docs doesnt exist add it
    }
  }
  // function to get the number of same tags between groups weighted by tag occurrence
  const numberOfSameTags = (item1, item2) => {
    let num = 0
    for (const i of item1) {
      let sameVal
      if (item2.some(e => {
        const check = String(e[0]) == String(i._id)
        if (check) sameVal = e
        return check
      })) {
        num += 1 * sameVal[1] // weighting it by the number of occurrences of that tag
      }
    }
    return num
  }
  // sort by tag relevance
  relevantGroups.sort(function (first, second) {
    return numberOfSameTags(second.tags, items) - numberOfSameTags(first.tags, items)
  })
  // return max number ammout
  if (relevantGroups.length > maxGroupsToShow) relevantGroups = relevantGroups.slice(0, maxGroupsToShow)
  return relevantGroups
}

// temp function to view members to add to a group
module.exports.explore = async (req, res) => {
  const groupId = req.params.id
  const group = await GroupSchema.findById(groupId).populate('polls') // only display people who are not already in the group
  const activeGroupPolls = group.polls.filter(poll => poll.active === true)
  const groupPollsAffected = activeGroupPolls.map(poll => poll.affected)
  const students = await StudentProfile.find({
    _id: { $nin: groupPollsAffected },
    groups: { $nin: [groupId] },
    invites: { $nin: [groupId] },
    'settings.isSearchable': true
  })
  res.render('groups/explore', { students: students, group: group })
}

module.exports.renderNewForm = async (req, res) => {
  const allTags = await Tag.find({})
  res.render('groups/new', { allTags })
}

module.exports.createGroup = async (req, res) => {
  // Create a new Group
  const group = new GroupSchema({
    name: req.body.name,
    description: req.body.description
  })
  await group.save()

  // Add the entered tags
  req.body.group = group._id
  try {
    if (req.body.tags) {
      await this.editTags(req, res)
    }
  } catch (err) {
    req.flash('error', err.message)
  }

  // At the current user as the first memebr
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
  const group = await GroupSchema.findById(req.params.id).populate(['members', 'invites', 'tags', 'meetings', 'links'])
  const polls = group.polls
  const groupPolls = await Poll.find({ _id: { $in: polls } }).populate(['affected', 'group'])
  const allTags = await Tag.find({})
  const { covidSafe } = await covidCheck(req.user._id)
  const links = group.links
  res.render('groups/show', { group, groupPolls, allTags, KickReasons, covidSafe, links })
}

module.exports.search = async (req, res) => {
  const userGroups = req.user.groups
  let notUserGroups
  let foundUserGroups
  if (req.query.search) { // get search results
    const regex = new RegExp(this.escapeRegex(req.query.search), 'gi') // 'gi' are flags, g - global, i - ignore case
    // user searched something
    notUserGroups = await GroupSchema.find({ name: regex, _id: { $nin: userGroups } }).populate(['members', 'polls'])
    foundUserGroups = await GroupSchema.find({ name: regex, _id: { $in: userGroups } })
  }
  res.render('groups/searchResults', { notUserGroups: notUserGroups, foundUserGroups, userSearched: req.query.search })
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
  await this.deleteMemberPolls(group, memberId)
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

module.exports.deleteMemberPolls = async (group, memberId) => {
  const polls = await Poll.find({ _id: { $in: group.polls } })
  const member = await StudentProfile.findById(memberId)
  for (const poll of polls) {
    if (poll.members.includes(memberId) || poll.affected == memberId) {
      await pollControl.removeFromPoll(poll, member)
    }
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

module.exports.escapeRegex = function (text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
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
    // If the tag doesn't already exist, add it to the tag schem
    // Otherwise add it to the group
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
