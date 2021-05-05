// to be replaced with database access
const meetings = [{
  GroupName: 'Default meeting',
  StartTime: '12:00',
  EndTime: '1:00'
}]

module.exports.add = (newMeeting) => {
  meetings.push(newMeeting)
}

module.exports.list = () => {
  return meetings
}

module.exports.determineMeetingLocation = (students) => {
  // collect all the location data from the students involved in the meeting
  const locations = students.map((obj) => {
    const locationData = { location: obj.location, geodata: obj.geodata }
    return locationData
  })
  // TODO: Refactor to Josh's centralised algorithm
  // hard coded naive approach is to take a random location of one of the meeting participants, this will be changed to Josh's algorith
  const meetingLocation = locations[Math.floor(Math.random() * locations.length)]
  return meetingLocation
}
