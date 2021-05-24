# Testing framework

## Status

Accepted

## Context

We want a test framework that has good support for Javascript and Node.
[Jest](https://jestjs.io) is the standard, recommended test framework for Javascript and Node apps. ```Jest``` also produces coverage reports. A separate tool (```supertest```) is used for routes tests.

## Decision

We will use ```Jest``` as our testing framework.

## Consequences

```Jest``` is intended to be used for unit tests of your logic and your components rather than the DOM quirks. ```Jest``` is a Node-based runner. This means that the tests always run in a Node environment and not in a real browser. This lets us enable fast iteration speed and prevent flakiness. By default, when you run `npm test`, Jest will only run the tests related to files changed since the last commit. For more information, look at this [README](https://github.com/stevenokennedy/adr-react) and search for `Jest`.

## Filename Conventions

Jest will look for test files with any of the following popular naming conventions:

* Files with `.js` suffix in the `__tests__` folder.

The `__tests__` and `coverage` folders can be located at any depth under the `tests` top level folder.