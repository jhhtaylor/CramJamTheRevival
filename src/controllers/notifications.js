const { GroupSchema } = require('../db/groups')
const { StudentProfile } = require('../db/studentProfiles')
const { Poll } = require('../db/poll')
// Public

module.exports.index = async (req, res) => {
  const userInvites = req.user.invites
  const groupInvites = await GroupSchema.find({ _id: { $in: userInvites } })
  const userPolls = req.user.polls
  const polls = await Poll.find({ _id: { $in: userPolls } }).populate(['affected', 'group'])
  res.render('notifications', { groupInvites, userPolls: polls })
}
