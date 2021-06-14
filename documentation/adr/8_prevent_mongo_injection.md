# Prevent Mongo Injection 

## Status

Accepted

## Context

Mongo injection is a method by which unwanted queries are created by users entering query information into text boxes and query strings. Object keys starting with a `$` or containing a `.` are reserved for use by MongoDB as operators. Without this sanitization, malicious users could send an object containing a `$` operator, or including a `.`, which could change the context of a database operation. Most notorious is the `$where` operator, which can execute arbitrary JavaScript on the database.

The best way to prevent this is to sanitize the received data, and remove any offending keys, or replace the characters with a 'safe' one.

## Decision

A package express-mongo-sanitize, will be used. This package uses a middleware to remove any special characters in query parameters.

## Consequences

Prevent mongo injection from taking place through queries.
