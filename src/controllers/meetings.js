const { MeetingSchema } = require('../db/meetings')
const { GroupSchema } = require('../db/groups')
const { CovidSurvey } = require('../db/covidSurvey')
const { getGeocode } = require('../../utils/geocodeAddress.js')
const { StudentProfile } = require('../db/studentProfiles')

module.exports.index = async (req, res) => {
  const userGroups = req.user.groups
  const meetings = await MeetingSchema.find({ group: { $in: userGroups } }).populate(['group'])
  const { covidSafe } = await this.covidCheck(req.user._id)
  res.render('meetings/index', { meetings, covidSafe })
}

module.exports.covidCheck = async (userID) => {
  const lastSurvey = await CovidSurvey.findOne({ student: userID }, {}, { sort: { testDate: -1 } })
  const covidSafe = lastSurvey && lastSurvey.covidSafe && lastSurvey.currentTest
  let covidMessage = 'Covid Safe, Test Taken Today'
  if (!lastSurvey) covidMessage = 'No Test Taken'
  else if (!lastSurvey.currentTest) covidMessage = 'No Test Taken For Today'
  else if (!covidSafe) covidMessage = 'Your Survey Had Potential Covid Symptoms'
  return { lastSurvey, covidSafe, covidMessage }
}

module.exports.listAllowedToAttend = async (userIDs) => {
  const allowedUsers = []
  for (const user of userIDs) {
    const { lastSurvey, covidSafe, covidMessage } = await this.covidCheck(user)
    if (covidSafe) allowedUsers.push(user._id)
  }
  return allowedUsers
}

module.exports.show = async (req, res) => {
  const meeting = await MeetingSchema.findById(req.params.meetingid).populate(['group']).populate('attendees')
  const userIDs = meeting.attendees.map(e => { return e._id })
  const attendees = meeting.attendees
  const inMeeting = userIDs.includes(req.user._id)
  const allowedToAttend = await this.listAllowedToAttend(attendees)
  const { lastSurvey, covidSafe, covidMessage } = await this.covidCheck(req.user._id)
  res.render('meetings/show', { meeting, lastSurvey, covidSafe, covidMessage, attendees, allowedToAttend, inMeeting })
}

module.exports.addToMeeting = async (req, res) => {
  const meeting = await MeetingSchema.findById(req.params.meetingid)
  meeting.attendees.push(req.user._id)
  await meeting.save()
  res.redirect(`/meetings/${req.params.meetingid}`)
}

module.exports.renderNewForm = async (req, res) => {
  const group = await GroupSchema.findById(req.params.groupid).populate('members')
  const bestAddress = this.determineMeetingLocation(group.members)
  res.render('meetings/new', { group, bestAddress })
}

module.exports.createMeeting = async (req, res) => {
  const group = await GroupSchema.findById(req.params.groupid)
  if (group == null) {
    req.flash('error', 'Group does not exist')
    return res.redirect('/')
  }
  const start = new Date(`${req.body.date} ${req.body.startTime}`)
  const end = new Date(`${req.body.date} ${req.body.endTime}`)
  if (end < start || start < Date.now()) {
    req.flash('error', 'invalid meeting time')
    return res.redirect(`/meetings/new/${group._id}`)
  }

  const meeting = new MeetingSchema({
    name: req.body.name,
    description: req.body.description,
    group: group._id,
    attendees: [req.user._id],
    start: start,
    end: end
  })

  if (req.body.address.length > 0) {
    const coords = await getGeocode(req.body.address)
    if (coords == null) {
      req.flash('error', 'invalid location')
      return res.redirect(`/meetings/new/${group._id}`)
    }
    meeting.location = { type: 'Point', coordinates: coords }
  } else {
    meeting.location = { type: 'Online', coordinates: [] }
  }
  meeting.save()
  await GroupSchema.findByIdAndUpdate(req.params.groupid, { $push: { meetings: meeting._id } })

  req.flash('success', 'Created new meeting!')
  return res.redirect(`/meetings/${meeting._id}`)
}

module.exports.arrivedHome = async (req, res)=>{
  const meeting = await MeetingSchema.findById(req.params.meetingid)
  const now = Date.now()
  const lim = meeting.end
  lim.setHours(meeting.end.getHours()+1)
  if(meeting.start <= now && now < lim && !meeting.homeStudents.includes(req.params.userid)){
    meeting.homeStudents.push(req.params.userid)
  }
  await meeting.save()
}



module.exports.determineMeetingLocation = (students) => {
  // collect all the location data from the students involved in the meeting
  const locations = students.map((obj) => {
    const locationData = { location: obj.location, geodata: obj.geodata }
    return locationData
  })

  // Calculate which of the students registered addresses is the most central
  // Does not offer other meeting locations yet
  function deg2rad(deg){
    return deg*Math.PI/180
  }

  function getDistance($latitude1, $longitude1, $latitude2, $longitude2) {  
      $earth_radius = 6371;

      $dLat = deg2rad($latitude2 - $latitude1);  
      $dLon = deg2rad($longitude2 - $longitude1);  

      $a = Math.sin($dLat/2) * Math.sin($dLat/2) + Math.cos(deg2rad($latitude1)) * Math.cos(deg2rad($latitude2)) * Math.sin($dLon/2) * Math.sin($dLon/2);  
      $c = 2 * Math.asin(Math.sqrt($a));  
      $d = $earth_radius * $c;  

      return $d;  
  }

  let distanceSum = 0
  let minDistanceSum = Infinity
  let pointID = 0
  for (let i = 0; i < locations.length; i++) {
    distanceSum = 0
    for (let j = 0; j < locations.length; j++) {
      distanceSum += getDistance(
        locations[i].geodata.coordinates[0], 
        locations[i].geodata.coordinates[1], 
        locations[j].geodata.coordinates[0], 
        locations[j].geodata.coordinates[1])
    }
    if (distanceSum <= minDistanceSum && distanceSum !== 0) {
      minDistanceSum = distanceSum
      pointID = i
    }
  }
  const meetingLocation = locations[pointID]
  return meetingLocation
}
