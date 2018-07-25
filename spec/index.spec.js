const { expect } = require('chai');
const { app } = require('../index');
const request = require('supertest')(app);

describe('soundtown API', () => {
  it('/api/sample', () => request
    .post('/api/sample')
    .attach('file', 'spec/soundtown-simulated-sample.caf')
    .then((({ body }) => {
      expect(body.Contents).to.have.all.keys('c3', 'd3', 'e3', 'f3', 'g3', 'a3', 'b3', 'c4', 'd4', 'e4', 'f4', 'g4');
    })));
});
