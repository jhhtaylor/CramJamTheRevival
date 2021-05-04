const { Poll } = require('../db/poll')
const { StudentProfile } = require('../db/studentProfiles')

module.exports.showPoll = async (req, res) => {
  const { pollid } = req.body
  const poll = await Poll.findById(pollid)
  res.render('polls/vote', { poll })
}

module.exports.showAllPolls = async (req, res) => {
  const polls = await Poll.find({})
  res.render('polls/allPolls', { polls })
}

module.exports.votePoll = async (req, res) => {

}

module.exports.createPoll = async (req, res) => {
  const members = []
  members.push(req.user._id)
  const newMembers = await StudentProfile.find({})
  newMembers.forEach(elem => {
    if (Math.random() > 0.5) { members.push(elem._id) }
  })
  const newPoll = new Poll({
    members,
    name: `New poll from: ${req.user.username}`,
    action: 'Add'
  })
  await newPoll.save()
  req.flash('success', 'Successfuly created new poll')
  res.redirect('/polls')
}
