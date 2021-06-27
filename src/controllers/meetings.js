const {MeetingSchema} = require('../db/meetings')
const { GroupSchema } = require('../db/groups')
const { StudentProfile } = require('../db/studentProfiles')
const { getGeocode} = require('../../utils/geocodeAddress.js')

module.exports.index = async (req, res) => {
  const userGroups = req.user.groups
  const meetings = await MeetingSchema.find({ group: { $in: userGroups } }).populate(['group'])
  console.log(meetings)
  res.render('meetings/index', { meetings })
}

module.exports.show = async (req, res) => {
  const meeting = await MeetingSchema.findById(req.params.meetingid).populate(['group'])
  res.render('meetings/show', { meeting})
}

module.exports.renderNewForm = async (req, res) => {
  const group = await GroupSchema.findById(req.params.groupid).populate('members')
  const bestAddress = this.determineMeetingLocation(group.members)
  res.render('meetings/new', {group, bestAddress})
}

module.exports.createMeeting = async (req, res) => {
  const group = await GroupSchema.findById(req.params.groupid)
  if(group == null){
    req.flash('error', "Group does not exist")
    res.redirect('/')
    return
  } 
  const start = new Date(`${req.body.date} ${req.body.startTime}`)
  const end = new Date(`${req.body.date} ${req.body.endTime}`)
  console.log(start)
  console.log(end)
  if(end < start){
    req.flash('error', "invalid meeting time")
    res.redirect(`/meetings/new/${group._id}`)
    return
  }
  const coords = await getGeocode(req.body.address)
  const meeting = new MeetingSchema({
    name: req.body.name,
    description: req.body.description,
    group: group._id,
    attendees: group.members,
    location: {
      type: "Point",
      coordinates: coords
    },
    start: start,
    end: end
  })
  meeting.save()

  await GroupSchema.findByIdAndUpdate(req.params.groupid, { $push: { meetings: meeting._id } })

  req.flash('success', 'Created new meeting!')
  res.redirect('/groups')
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
