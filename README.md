# soundtown

soundtown is a mobile app that lets you record sounds around you using your phone to create a 12 note musical instrument.

## Prerequisites

Ensure you have at least NodeJS v10.1.0. JavaScript code has been written to ES6 standard.

## Installing

1. Fork and clone this repository to your machine
2. Using terminal cd to the cloned directory and run this command:

```
npm install
```

3. Create a directory named 'config' in the root of this repository. Create file 'index.js' in the config directory
4. Open 'index.js' file and paste the following, save and close the file:

```
const accessKeys = {
  AWS_ACCESS_KEY_ID: [ENTER AWS KEY HERE],
  AWS_SECRET_ACCESS_KEY: [ENTER AWS KEY HERE],
  SONICAPI_ACCESS_ID: [ENTER SONICAPI KEY HERE],
  CLOUDCONVERT_API_KEY: [ENTER CLOUDCONVERT KEY HERE],
};

module.exports = accessKeys;
```

## Running the tests

To run the tests run the following command in terminal:

```
npm test
```

### Tests

The test file tests for the following:

1. Positive testing of all endpoints
2. Negative testing of all end points - tests for 400, 404 and 500 errors

These are all the end points:

- POST /api/sample
- GET /api/reverb

## Deployed App

Deployed app: [soundtown](https://soundtown-dev.herokuapp.com/)

## Built With

* [NPM](https://docs.npmjs.com) - JavaScript package manager
* [Express](http://expressjs.com/en/4x/api.html) - Web Application Framework
