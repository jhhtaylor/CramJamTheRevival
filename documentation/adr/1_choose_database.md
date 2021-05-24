# Choosing a Database

## Status

Accepted

## Context

The app requires persistant storage for profiles, meetings, groups. Some of hte data requires relations between a profile and the groups that account is linked to, the members involved in a meeting.

## Decision

MongoDB has been chosen as the primary storage method for persistant data.

## Consequences

Storing user data becomes easily manageable using Mongoose and MongoDB. Dependancies can be populated easily. 