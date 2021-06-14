# Prevent Mongo Injection 

## Status

Accepted

## Context

Mongo injection is a method by which unwanted queries are created by users entering query information into text boxes and query strings.

## Decision

A package express-mongo-sanitize, will be used. This package uses a middleware to remove any special characters in query parameters.

## Consequences

Prevent mongo injection from taking place through queries.
