# Testing Database

## Status

Proposed

## Context

Testing the database connection verifies the basic command structures function.

## Decision

Using an in memory mongodb server via the ```mongodb-memory-server``` package.

## Consequences

The database connection can be replicated and tested in memory. This allows the tests to be run locally, and on CI platforms without requiring a test database to be set up in the cloud.