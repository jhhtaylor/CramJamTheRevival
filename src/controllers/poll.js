const { Poll } = require('../db/poll')
const { StudentProfile } = require('../db/studentProfiles')
const { GroupSchema } = require('../db/groups')
const group = require('./groups')

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
  if (members === voted) { // checking sorted arrays
    votePoll.active = false
    await votePoll.save()
  }
  this.updatePoll(votePoll._id)
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

module.exports.createPoll = async (req, res) => {
  const { groupId, action, memberId } = req.params
  const group = await GroupSchema.findById(groupId).populate('members')
  const members = group.members
  const newPoll = new Poll({
    members,
    name: `New poll from: ${req.user.username}`,
    group: groupId,
    action,
    affected: memberId
  })
  await newPoll.save()

  await StudentProfile.updateMany({ _id: { $in: members } },
    { $push: { polls: newPoll._id } })

  await GroupSchema.updateOne({ _id: groupId },
    { $push: { polls: newPoll._id } })

  req.flash('success', 'Successfuly created new poll')
  res.redirect('/polls')
}

module.exports.updatePoll = async (pollId) => {
  const poll = await Poll.findById(pollId)
  const group = await GroupSchema.findById(poll.group)

  if (poll.votes.yes === group.members.length) {
    switch (poll.action) {
      case 'Add':
        group.addGroupMember(group._id, poll.affected)
        break

      case 'Invite':
        group.inviteGroupMember(group._id, poll.affected)
        break

      case 'Remove':
        group.deleteGroupMember(group._id, poll.affected)
        break
    }
    await GroupSchema.updateOne({ _id: groupId },
      { $pull: { polls: pollId } })
  }
}
