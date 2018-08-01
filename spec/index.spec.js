const { expect } = require('chai');
const { describe, it } = require('mocha');
const supertest = require('supertest');
const app = require('../app');

const request = supertest(app);

describe('soundtown API', function () {
  this.timeout(20000);
  describe('/api/sample', () => {
    it('POST with .caf file returns URLs for required tones', () => request
      .post('/api/sample')
      .attach('file', 'spec/soundtown-simulated-sample.caf')
      .then((({ body }) => {
        expect(body.convertedTones).to.have.all.keys('c3', 'd3', 'e3', 'f3', 'g3', 'a3', 'b3', 'c4', 'd4', 'e4', 'f4', 'g4');
      })));
    it('POST without a file returns status 415', () => request
      .post('/api/sample')
      .expect(415));
    it('POST with wrong file type returns status 415', () => request
      .post('/api/sample')
      .attach('file', 'spec/soundtown-sample.mp3')
      .expect(415));
  });
});
