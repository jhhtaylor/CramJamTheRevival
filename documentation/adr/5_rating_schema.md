# Rating Schema

## Status

Proposed

## Context

Each team member can rate the students in their group. In this relationship, there is a many-to-one, many ratings for one student.

## Decision

The ratings and the respective ID of the rater should be stored in the StudentProfile schema.

## Consequences

It will be easy to track who has voted on who, either allowing them to change their rating, or only allowing them to rate another student once. A case can be made where this relationship will become unbounded, with too many ratings to consider and the internal array becoming too large, but in this case the student is limited to 10 groups, with probably less than 10 students in each group.