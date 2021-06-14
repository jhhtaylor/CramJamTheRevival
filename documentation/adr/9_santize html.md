# Remove HTML From Text 

## Status

Accepted

## Context

HTML tags can potentially be embedded in a piece of text. This can lead to some unwanted behaviour with scripts being placed by the user.

## Decision

The express-validator package has been used to escape the HTML characters.

## Consequences

Prevent unwanted HTML being embedded in text.