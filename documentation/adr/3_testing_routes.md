# Testing Routes

## Status

Proposed

## Context

The routes of the app should be tested to ensure the desired functionality is executed.

## Decision

Using a request mock package called ```supertest```, we are able to generate requests and receive responses back.

## Consequences

The response to the request can be verified however, user data such as currently logged in user is unavailable. But for simple get and post requests the data can be verified using the ```statusCode```, ```redirectRoute```, and cookie data. Furthermore, if the post request is exectured, the database can be queried to verify the correct results were obtained.