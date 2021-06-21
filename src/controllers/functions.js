// Used in Poll.js to create an 'Add' poll. i.e create a poll to request to join a group
// Returns members and an error
// Poll should not be created if the affected person is already part of the group
// Poll should not be created if the affected person is already invited to the group
// Poll should not be created if the affected person is already in a poll to be invited to the group
// All current group members should be allowed to vote
const add = function (isInGroup, isInvited, isInPoll, hasRequested, members, affected, user) {
  let error = null
  if (isInGroup || isInvited || isInPoll) {
    const err = 'Member is already in the group'
    error = err
  }
  return { members: members, error: error }
}

// Used in Poll.js to create an 'Invite' poll. i.e create a poll to invite a user to join a group
// Returns members and an error
// Poll should not be created if the affected person is already part of the group
// Poll should not be created if the user is attempting to invite themself
// Poll should not be created if the user is attempting to invite someone who has already requested to join
// Poll should not be created if the affected person is already in a poll to be added to the group
// All current group members should be allowed to vote
const invite = function (isInGroup, isInvited, isInPoll, hasRequested, members, affected, user) {
  console.log(`hasReq: ${hasRequested}`)
  console.log(`isInv: ${isInvited}`)
  let error = null
  if (isInGroup || isInvited || isInPoll) {
    const err = 'Member is already in the group'
    error = err
  }
  if (user == affected) {
    const err = 'Member cannot create a poll to invite themself to a group'
    error = err
  }
  return { members: members, error: error }
}

// Used in Poll.js to create an 'Remove' poll. i.e create a poll to remove a use from a group
// Returns members and an error
// Poll should not be created if the affected person is not already part of the group
// Poll should not be created if the user is attempting to remove themself (they may simply leave the group, no poll needs to be created)
// All current group members, except the affected member, should be allowed to vote
const remove = function (isInGroup, isInvited, isInPoll, hasRequested, members, affected, user) {
  let error = null
  if (!isInGroup) {
    const err = 'Member is not in group'
    error = err
  }
  if (user == affected) {
    const err = 'Member cannot create a poll to remove themself from a group'
    error = err
  }
  members = members.filter(function (e) {
    return e != affected
  })
  return { members: members, error: error }
}

module.exports = {
//  name_exported : internal_name
  Add: add,
  Invite: invite,
  Remove: remove
}
