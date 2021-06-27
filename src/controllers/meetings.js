const {MeetingSchema} = require('../db/meetings')
const { GroupSchema } = require('../db/groups')
const { getGeocode} = require('../../utils/geocodeAddress.js')

module.exports.index = async (req, res) => {
  const userGroups = req.user.groups
  const meetings = await MeetingSchema.find({ group: { $in: userGroups } }).populate(['group'])
  res.render('meetings/index', { meetings })
}

module.exports.show = async (req, res) => {
  const meeting = await MeetingSchema.findById(req.params.meetingid).populate(['group'])
  res.render('meetings/show', {meeting})
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
    return res.redirect('/')
  } 
  const start = new Date(`${req.body.date} ${req.body.startTime}`)
  const end = new Date(`${req.body.date} ${req.body.endTime}`)
  if(end < start){
    req.flash('error', "invalid meeting time")
    return res.redirect(`/meetings/new/${group._id}`)
    
  }


  const meeting = new MeetingSchema({
    name: req.body.name,
    description: req.body.description,
    group: group._id,
    attendees: group.members,
    start: start,
    end: end
  })

  if(req.body.address.length > 0){
    const coords = await getGeocode(req.body.address)
    if(coords == null){
      req.flash('error', "invalid location")
      return res.redirect(`/meetings/new/${group._id}`)
      
    }
    meeting.location = {type: 'Point', coordinates: coords}
  }else{
    meeting.location = {type: 'Online', coordinates: []}
  }
  meeting.save()
  await GroupSchema.findByIdAndUpdate(req.params.groupid, { $push: { meetings: meeting._id } })

  req.flash('success', 'Created new meeting!')
  return res.redirect('/groups')
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
