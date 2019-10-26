import { expect } from 'chai';

import { api as ProgramsApi, SortType } from '../../src/api/search_programs';
import { GeoLocation } from '../../src/repos/programs/repo';

describe('Search Programs Tests', () => {
  describe('By RELEVANCY', () => {
    describe('when we search for "long beach air", length 1, offset 0', () => {
      it('should return the correct result', () => {
        const result = ProgramsApi.searchPrograms(
          {
            search: 'long beach air',
            length: 1,
            offset: 0,
          },
          SortType.RELEVANCY,
        );

        expect(result).to.deep.equal(
          {
            totalNumberOfMatchingPrograms: 3,
            programs: [{
              school: 'Long Beach State University',
              programName: 'Airline Management with Asia Focus',
              degreeType: 'Associate\'s',
              delivery: 'Online',
              annualTuition: 3456,
              location: 'Long Beach, CA',
              geoLocation: {
                latitude: 33.77005,
                longitude: -118.193741,
              },
              durationInDays: 90,
            }],
          },
        );
      });
    });

    describe('when we search for "santa", length 2, offset 9', () => {
      it('should return the correct results', () => {
        const result = ProgramsApi.searchPrograms(
          {
            search: 'santa',
            length: 2,
            offset: 9,
          },
          SortType.RELEVANCY,
        );

        expect(result).to.deep.equal(
          {
            programs: [
              {
                annualTuition: 3234,
                degreeType: "Associate's",
                delivery: 'Online',
                durationInDays: 30,
                geoLocation: {
                  latitude: 34.024212,
                  longitude: -118.496475,
                },
                location: 'Santa Monica, CA',
                programName: 'CATVIA V5 Fundamentals Boot Camp',
                school: 'Santa Monica College',
              },
              {
                annualTuition: 3847,
                degreeType: "Associate's",
                delivery: 'Online',
                durationInDays: 60,
                geoLocation: {
                  latitude: 38.44466,
                  longitude: -122.720306,
                },
                location: 'Santa Rosa, CA',
                programName: 'Aerospace Engineering',
                school: 'Santa Rosa Junior College',
              },
            ],
            totalNumberOfMatchingPrograms: 20,
          },
        );
      });
    });
  });

  describe('By COST_HIGH_TO_LOW', () => {
    describe('when we search for "santa monica", length 1, offset 0', () => {
      it('should return the highest cost result', () => {
        const result = ProgramsApi.searchPrograms(
          {
            search: 'santa monica',
            length: 1,
            offset: 0,
          },
          SortType.COST_HIGH_TO_LOW,
        );


        expect(result).to.deep.equal(
          {
            programs:
              [
                {
                  annualTuition: 4960,
                  degreeType: "Associate's",
                  delivery: 'Online',
                  durationInDays: 120,
                  geoLocation: {
                    latitude: 34.024212,
                    longitude: -118.496475,
                  },
                  location: 'Santa Monica, CA',
                  programName: 'Aviation Safety and Security',
                  school: 'Santa Monica College',
                },
              ],
            totalNumberOfMatchingPrograms: 10,
          },
        );
      });
    });
  });

  describe('By COST_LOW_TO_HIGH', () => {
    describe('when we search for "santa monica", length 1, offset 0', () => {
      it('should return the lowest cost result', () => {
        const result = ProgramsApi.searchPrograms(
          {
            search: 'santa monica',
            length: 1,
            offset: 0,
          },
          SortType.COST_LOW_TO_HIGH,
        );


        expect(result).to.deep.equal(
          {
            programs:
              [
                {
                  annualTuition: 1111,
                  degreeType: "Associate's",
                  delivery: 'Campus',
                  durationInDays: 120,
                  geoLocation: {
                    latitude: 34.024212,
                    longitude: -118.496475,
                  },
                  location: 'Santa Monica, CA',
                  programName: 'Aviation Science',
                  school: 'Santa Monica College',
                },
              ],
            totalNumberOfMatchingPrograms: 10,
          },
        );
      });
    });
  });

  describe('By DURATION', () => {
    describe('when we search for "santa monica", length 2, offset 0', () => {
      it('should return the lowest duration results', () => {
        const result = ProgramsApi.searchPrograms(
          {
            search: 'santa monica',
            length: 2,
            offset: 0,
          },
          SortType.DURATION,
        );


        expect(result).to.deep.equal(
          {
            programs:
              [
                {
                  annualTuition: 4908,
                  degreeType: "Bachelor's",
                  delivery: 'Campus',
                  durationInDays: 30,
                  geoLocation: {
                    latitude: 34.024212,
                    longitude: -118.496475,
                  },
                  location: 'Santa Monica, CA',
                  programName: 'CAD/CAM Specialization',
                  school: 'Santa Monica College',
                },
                {
                  annualTuition: 3234,
                  degreeType: "Associate's",
                  delivery: 'Online',
                  durationInDays: 30,
                  geoLocation: {
                    latitude: 34.024212,
                    longitude: -118.496475,
                  },
                  location: 'Santa Monica, CA',
                  programName: 'CATVIA V5 Fundamentals Boot Camp',
                  school: 'Santa Monica College',
                },
              ],
            totalNumberOfMatchingPrograms: 10,
          },
        );
      });
    });
  });

  describe('By DISTANCE', () => {
    describe('when we search for "Biomanufacturing", length 5, offset 0, and lat: 39 long:-122', () => {
      it('should return the three results lowest distance order', () => {
        const userGeoLocation: GeoLocation = {
          latitude: 39,
          longitude: -122,
        };

        const result = ProgramsApi.searchPrograms(
          {
            search: 'Biomanufacturing',
            length: 3,
            offset: 0,
            userGeoLocation,
          },
          SortType.DISTANCE,
        );


        expect(result).to.deep.equal(
          {
            programs:
            [
              {
                annualTuition: 1555,
                degreeType: "Bachelor's",
                delivery: 'Campus',
                durationInDays: 120,
                geoLocation: {
                  latitude: 34.024212,
                  longitude: -118.496475,
                },
                location: 'Santa Monica, CA',
                programName: 'Biomanufacturing',
                school: 'Santa Monica College',
              },
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
              {
                annualTuition: 2451,
                degreeType: "Associate's",
                delivery: 'Campus',
                durationInDays: 90,
                geoLocation: {
                  latitude: 42.65258,
                  longitude: -73.756233,
                },
                location: 'Albany, NY',
                programName: 'Biomanufacturing',
                school: 'SUNY Albany',
              },
            ],
            totalNumberOfMatchingPrograms: 3,
          },
        );
      });
    });
  });
});
