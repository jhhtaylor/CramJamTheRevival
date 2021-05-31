const { Poll } = require('../db/poll')
const { StudentProfile } = require('../db/studentProfiles')
const { GroupSchema } = require('../db/groups')

module.exports.showPoll = async (req, res) => {
  const { poll } = req.params
  const found = await Poll.findById(poll)
  res.render('polls/vote', { poll: found })
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

  res.redirect('/polls')
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
  const members = []
  members.push(req.user._id)
  const newMembers = await StudentProfile.find({})
  const member = newMembers[0]
  newMembers.forEach(elem => {
    if (Math.random() > 0.5) { members.push(elem._id) }
  })
  const newPoll = new Poll({
    members,
    name: `New poll from: ${req.user.username}`,
    action,
    affected: memberId
  })
  await newPoll.save()
  req.flash('success', 'Successfuly created new poll')
  res.redirect('/polls')
}
