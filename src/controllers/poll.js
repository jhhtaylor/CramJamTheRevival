const { Poll } = require('../db/poll')
const { StudentProfile } = require('../db/studentProfiles')
const { GroupSchema } = require('../db/groups')
const groups = require('./groups')
const methods = require('./functions')

module.exports.showPoll = async (req, res) => {
  const { poll } = req.params
  const found = await Poll.findById(poll)
  const affected = await StudentProfile.findById(found.affected)
  const group = await GroupSchema.findById(found.group)
  res.render('polls/vote', { poll: found, affected, group })
}

module.exports.showAllPolls = async (req, res) => {
  const polls = await Poll.find({})
  res.render('polls/allPolls', { polls })
}

module.exports.votePoll = async (req, res) => {
  const { poll, type } = req.params
  const votePoll = await Poll.findById(poll)
  await this.vote(votePoll, type)
  votePoll.voted.push(req.user._id)
  await votePoll.save()
  const members = [...votePoll.members]
  members.sort()
  const voted = [...votePoll.voted]
  voted.sort()
  if (voted.length > (members.length / 2)) { // checking sorted arrays
    req.flash('success', 'Majority voted ')
    votePoll.active = false
    await votePoll.save()
    await this.updatePoll(votePoll._id, req)
  }
  await StudentProfile.updateMany({ _id: { $in: members } },
    { $pull: { polls: votePoll._id } })
  res.redirect('back')
}

module.exports.vote = async (poll, type) => {
  if (type === 'yes') {
    poll.votes.yes += 1
    await poll.save()
  } else {
    poll.votes.no += 1
    await poll.save()
  }
}

module.exports.pollExists = async (groupId, memberId, action) => {
  const group = await GroupSchema.findById(groupId).populate('polls')
  for (const poll of group.polls) {
    if (poll.action === action && poll.affected == memberId) { return true }
  }
  return false
}
module.exports.isInPoll = async (groupId, memberId, action) => {
  const group = await GroupSchema.findById(groupId).populate('polls')
  for (const poll of group.polls) {
    if ((poll.action === 'Invite' || poll.action === 'Add') && poll.affected == memberId) { return true }
  }
  return false
}
module.exports.hasRequested = async (groupId, memberId) => {
  const group = await GroupSchema.findById(groupId).populate('polls')
  for (const poll of group.polls) {
    if (poll.action === 'Add' && poll.affected == memberId) { return true }
  }
  return false
}

module.exports.newPoll = async (groupId, action, affected, members, owner) => {
  const newPoll = new Poll({
    members,
    name: `New poll from: ${owner}`,
    group: groupId,
    action,
    affected: affected
  })
  await newPoll.save()

  await StudentProfile.updateMany({ _id: { $in: members } },
    { $push: { polls: newPoll._id } })

  await GroupSchema.updateOne({ _id: groupId },
    { $push: { polls: newPoll._id } })
}

module.exports.createPoll = async (req, res) => {
  const { groupId, action, memberId } = req.params

  // Check if the poll already exists
  const pollExists = await this.pollExists(groupId, memberId, action)
  if (pollExists) {
    req.flash('error', 'This poll already exists')
    res.redirect('back')
    return
  }

  // Find group
  const group = await GroupSchema.findById(groupId)

  // Create variables
  const affected = memberId

  // Returns true if a member exists in a group or if a member has already been invited into a group
  const isInGroup = await groups.isInGroup(groupId, affected)
  const isInvited = await groups.isInvited(groupId, affected)
  const isInPoll = await this.isInPoll(groupId, affected)
  const hasRequested = await this.hasRequested(groupId, affected)

  // Use methods defined in ./function.js based on action instruction to find who the members of the poll should be or to determine errors
  const members = methods[action](isInGroup, isInvited, isInPoll, hasRequested, group.members, affected, req.user._id)
  if (members.error != null) {
    req.flash('error', members.error)
    res.redirect('back')
    return
  }

  // Create new poll
  await this.newPoll(groupId, action, affected, members.members, req.user.username).then(done => {
    req.flash('success', 'Successfuly created new poll')
  }).catch(err => {
    req.flash('error', err)
  })
  res.redirect(`/groups/${groupId}`)
}

module.exports.updatePoll = async (pollId, req) => {
  const poll = await Poll.findById(pollId)
  const group = await GroupSchema.findById(poll.group)
  switch (poll.action) {
    case 'Add':
      await groups.addGroupMember(group._id, poll.affected)
        .then(done => {
          req.flash('success', 'Request Successful')
        }).catch(err => {
          req.flash('error', err.message)
        })
      break

    case 'Invite':
      await groups.invite(group._id, poll.affected)
        .then(done => {
          req.flash('success', 'Invite Successful')
        }).catch(err => {
          req.flash('error', err.message)
        })
      break

    case 'Remove':
      await groups.deleteMember(group._id, poll.affected)
        .then(done => {
          req.flash('success', 'Remove Successful')
        }).catch(err => {
          req.flash('error', err.message)
        })
      break
  }
  await GroupSchema.updateOne({ _id: group._id },
    { $pull: { polls: pollId } })
}
