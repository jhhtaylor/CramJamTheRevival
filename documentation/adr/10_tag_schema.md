# Tag Schema

## Status

Proposed

## Context

A user can add tags to a group. Based on these tags, different groups may be suggested to the user. 

## Decision

The tags and the respective ID of the groups that have used that tag should be stored in an independemt Tag schema. Additionally, the id of the tag should be stored in the groups profile.

## Consequences

It will be easy to track which groups, and the students forming part of the groups, are interested in each tag. This decision is scalable and can be incorporated into the individual level easily so it is easy to track an indiviual's interests. 