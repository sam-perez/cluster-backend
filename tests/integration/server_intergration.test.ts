import { expect } from 'chai';
import * as R from 'ramda';

import createServer from '../../src/server';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

describe('Server Integration Tests', () => {
  let server;
  beforeEach(() => {
    server = createServer();
  });

  afterEach(() => {
    server.close();
  });

  const VALID_SEARCH_BODY = {
    search: 'bio',
    length: 1,
    offset: 0,
    userGeoLocation: {
      latitude: 0,
      longitude: 0,
    },
    sortType: 'COST_HIGH_TO_LOW',
  };

  describe('/search', () => {
    describe('validation errors', () => {
      const REQUEST_VALIDATION_ERR_STR = 'Validating the search request failed.';

      describe('when /search is missing "search"', () => {
        it('should fail with a validation error', async () => {
          const res = await request(server).post('/search').send(R.dissoc('search', VALID_SEARCH_BODY));

          expect(res.status).to.equal(200);
          expect(res.body).to.deep.equal({ error: REQUEST_VALIDATION_ERR_STR, result: null });
        });
      });

      describe('when /search is missing "length"', () => {
        it('should fail with a validation error', async () => {
          const res = await request(server).post('/search').send(R.dissoc('length', VALID_SEARCH_BODY));

          expect(res.status).to.equal(200);
          expect(res.body).to.deep.equal({ error: REQUEST_VALIDATION_ERR_STR, result: null });
        });
      });

      describe('when /search is missing "offset"', () => {
        it('should fail with a validation error', async () => {
          const res = await request(server).post('/search').send(R.dissoc('offset', VALID_SEARCH_BODY));

          expect(res.status).to.equal(200);
          expect(res.body).to.deep.equal({ error: REQUEST_VALIDATION_ERR_STR, result: null });
        });
      });

      describe('when /search has bogus "sortType"', () => {
        it('should fail with a validation error', async () => {
          const res = await request(server).post('/search').send(R.assoc('sortType', 'NONSENSE', VALID_SEARCH_BODY));

          expect(res.status).to.equal(200);
          expect(res.body).to.deep.equal({ error: REQUEST_VALIDATION_ERR_STR, result: null });
        });
      });

      describe('when /search has sortType=DISTANCE and userGeoLocation is missing', () => {
        it('should fail with a validation error', async () => {
          const res = await request(server).post('/search').send(
            R.pipe(
              R.dissoc('userGeoLocation'),
              R.assoc('sortType', 'DISTANCE'),
            )(VALID_SEARCH_BODY),
          );

          expect(res.status).to.equal(200);
          expect(res.body).to.deep.equal({ error: 'geoLocation is required for a distance sort.', result: null });
        });
      });

      describe('when /search succeeds', () => {
        it('should succeed with the correct results', async () => {
          const res = await request(server).post('/search').send(VALID_SEARCH_BODY);

          expect(res.status).to.equal(200);
          expect(res.body).to.deep.equal({
            error: null,
            result: {
              programs: [
                {
                  annualTuition: 4000,
                  degreeType: "Bachelor's",
                  delivery: 'Campus',
                  durationInDays: 60,
                  geoLocation: {
                    latitude: 33.77005,
                    longitude: -118.193741,
                  },
                  location: 'Long Beach, CA',
                  programName: 'Biomanufacturing',
                  school: 'Long Beach State University',
                },
              ],
              totalNumberOfMatchingPrograms: 3,
            },
          });
        });
      });
    });
  });
});
