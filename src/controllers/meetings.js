const {MeetingSchema} = require('../db/meetings')
const { GroupSchema } = require('../db/groups')

module.exports.index = async (req, res) => {
  const userGroups = req.user.groups
  const meetings = await MeetingSchema.find({ _id: { $in: userGroups } })
  res.render('meetings/index', { meetings })
}

module.exports.renderNewForm = async (req, res) => {
  const group = await GroupSchema.findById(req.params.groupid).populate('members')
  const bestAddress = this.determineMeetingLocation(group.members)
  console.log(bestAddress)
  res.render('meetings/new', {group, bestAddress})
}

module.exports.createMeeting = async (req, res) => {
  const group = await GroupSchema.findById(req.params.groupid)
  if(group == null){
    req.flash('error', err.message)
    res.redirect('/')
  } 

  const meeting = new MeetingSchema({
    name: req.body.name,
    description: req.body.description,
    group: group._id,
    location: {
      
    }
  })
  meeting.save()

  req.flash('success', 'Created new meeting!')
  res.redirect(`/groups/${req.params.groupid}`)
}

module.exports.determineMeetingLocation = (students) => {
  // collect all the location data from the students involved in the meeting
  const locations = students.map((obj) => {
    const locationData = { location: obj.location, geodata: obj.geodata }
    return locationData
  })

  // Calculate which of the students registered addresses is the most central
  // Does not offer other meeting locations yet
  let distanceSum = 0
  let minDistanceSum = Infinity
  let pointID = 0
  for (let i = 0; i < locations.length; i++) {
    distanceSum = 0
    for (let j = 0; j < locations.length; j++) {
      distanceSum += Math.sqrt(Math.pow(locations[i].geodata[i] - locations[j].geodata[i], 2) + Math.pow(locations[i].geodata[j] - locations[j].geodata[j], 2))
    }
    if (distanceSum <= minDistanceSum && distanceSum !== 0) {
      minDistanceSum = distanceSum
      pointID = i
    }
  }
  const meetingLocation = locations[pointID]
  return meetingLocation
}
