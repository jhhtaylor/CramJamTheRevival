const { ActivityLog } = require('../db/activityLog')

module.exports.viewLog = async (req, res) => {
  const log = await ActivityLog.find({})
  res.render('activityLog/view', { log })
}
