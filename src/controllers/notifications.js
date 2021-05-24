const { GroupSchema } = require('../db/groups')
const { StudentProfile } = require('../db/studentProfiles')
// Public

module.exports.index = async (req, res) => {
  const userInvites = req.user.invites
  const groupInvites = await GroupSchema.find({ _id: { $in: userInvites } })
  res.render('notifications', { groupInvites })
}
