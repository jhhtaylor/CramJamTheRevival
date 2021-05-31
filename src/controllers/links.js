
module.exports.index = async (req, res) => {
  // const userGroups = req.user.groups
  // const groups = await GroupSchema.find({ _id: { $in: userGroups } })
  // const randomGroup = await GroupSchema.findOne({ _id: { $nin: userGroups } })
  res.render('links/index')
}
