# Remove HTML From Text 

## Status

Accepted

## Context

HTML tags can potentially be embedded in a piece of text. This can lead to some unwanted behaviour with scripts being placed by the user. HTML sanitization is a process of examining an HTML documents and preserving same tags. However in this case we are preventing the user from using any HTML in the text as it is unneeded.

## Decision

The express-validator package has been used to escape the HTML characters and trim the empty spaces on the sides.

## Consequences

Prevent unwanted HTML being embedded in text.