const { GroupSchema } = require('../db/groups')
const { StudentProfile } = require('../db/studentProfiles')
const { MeetingSchema } = require('../db/meetings')
const { Poll } = require('../db/poll')
// Public

module.exports.index = async (req, res) => {
  const userInvites = req.user.invites

  const groupInvites = await GroupSchema.find({ _id: { $in: userInvites } })
  const userPolls = req.user.polls
  const polls = await Poll.find({ _id: { $in: userPolls } }).populate(['affected', 'group'])
  const groups = await GroupSchema.find({ _id: { $in: req.user.groups } }).populate({ 
      path: 'meetings',
      populate: [{
        path: 'group',
        model: 'Group'
      },
      {
        path: 'homeStudents',
        model: 'StudentProfile'
      }] 
  })
  let meetings = []
  let safeUsers = 0
  for (let group of groups) {
    for (let meeting of group.meetings) {
      const now = Date.now()
      const lim = meeting.end
      lim.setHours(meeting.end.getHours() + 1)
      if (meeting.start <= now && now < lim) {
        meetings.push(meeting)
        safeUsers+=meeting.homeStudents.length
        if(meeting.homeStudents.map(s=>s._id).includes(req.user._id))
          safeUsers--
      }
    }
  }

  res.render('notifications', { groupInvites, userPolls: polls, meetingsInProgress: meetings,safeUsers })
}
