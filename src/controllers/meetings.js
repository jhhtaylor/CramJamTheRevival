//to be replaced with database access
const meetings = [{
    GroupName: "Default meeting",
    StartTime: "12:00",
    EndTime: "1:00"
}]

module.exports.add = (newMeeting) => {
    meetings.push(newMeeting)
}

module.exports.list = ()=>{
    return meetings
}