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
