/**
 * Naive implementation of our program repo. For this challenge, the whole data set is maintained
 * in memory and operated on in memory. The main features we care about are being able to query
 * by relevancy, cost, duration, and distance. If this were a full fledged production project,
 * I would suggest using either 1) PSQL with a geolocation plugin 2) elastic search, which
 * provides this functionality out of the box. I would strongly push for option number 2, since
 * elastic search is essentially the perfect tool for this job (fuzzy string searches, flexible
 * scoring and ranking queries, good performance).
 */

import * as R from 'ramda';
import { getDistance } from 'geolib';
import programs from './programs.json';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { filter } from './filter';

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import stringSimilarity = require('string-similarity');

export enum DegreeType {
  ASSOCIATES = "Associate's",
  BACHELORS = "Bachelor's",
}

export enum Delivery {
  ONLINE = 'Online',
  CAMPUS = 'Campus',
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface Program {
  school: string;
  programName: string;
  degreeType: DegreeType;
  delivery: Delivery;
  annualTuition: number;
  location: string;
  geoLocation: GeoLocation;
  durationInDays: number;
}

export interface SearchResult {
  totalNumberOfMatchingPrograms: number;
  programs: Program[];
}

export interface ProgramRepo {
  searchByRelevance: (searchRequest: SearchRequest) => SearchResult;
  searchByCostLowToHigh: (searchRequest: SearchRequest) => SearchResult;
  searchByCostHighToLow: (searchRequest: SearchRequest) => SearchResult;
  searchByDuration: (searchRequest: SearchRequest) => SearchResult;
  searchByDistance: (searchRequest: SearchRequest) => SearchResult;
}

const IN_MEMORY_PROGRAMS = R.map((program: any): Program => ({
  school: program.School,
  programName: program['Program Name'],
  degreeType: program['Degree Type'] === DegreeType.ASSOCIATES ? DegreeType.ASSOCIATES : DegreeType.BACHELORS,
  delivery: program.Delivery === Delivery.ONLINE ? Delivery.ONLINE : Delivery.CAMPUS,
  annualTuition: program['Annual Tuition'],
  location: program.Location,
  geoLocation: {
    latitude: program.Latitude,
    longitude: program.Longitude,
  },
  durationInDays: program['Duration In Days'],
}), programs);

const filterablePrograms: string[] = R.map(
  (p: Program): string => R.join(
    '|',
    [
      `${p.school}`,
      `${p.programName}`,
      `${p.degreeType}`,
      `${p.delivery}`,
      `${p.location}`,
      `${p.durationInDays}`,
    ],
  ),
  IN_MEMORY_PROGRAMS,
);

const findMatchingPrograms = (search: string): Program[] => {
  // convert each program to a filterable string
  const filteredProgramsIdx = filter(search, filterablePrograms, { mark: false }).items;

  const filteredPrograms = R.map(
    (id: number) => IN_MEMORY_PROGRAMS[id],
    filteredProgramsIdx,
  );

  return filteredPrograms;
};

/**
 * Our relevance scoring algorithm. We find the string similarity of the search term
 * with the school, program name, degree type, and location. Naive, but for now each
 * term is weighted equally.
 * */

const relevanceScorer = (search: string, program: Program): number => R.sum(
  [
    stringSimilarity.compareTwoStrings(search, program.school),
    stringSimilarity.compareTwoStrings(search, program.programName),
    stringSimilarity.compareTwoStrings(search, program.degreeType),
    stringSimilarity.compareTwoStrings(search, program.location),
  ],
);

const getSearchResultFromSortedPrograms = (
  sortedPrograms: Program[],
  searchRequest: SearchRequest,
): SearchResult => ({
  totalNumberOfMatchingPrograms: sortedPrograms.length,
  programs: sortedPrograms.slice(searchRequest.offset, searchRequest.offset + searchRequest.length),
});

export interface SearchRequest {
  search: string;
  length: number;
  offset: number;
  userGeoLocation?: GeoLocation;
}

const basicSearchWrapper = (
  programSorter: (matchingPrograms: Program[], searchRequest: SearchRequest) => Program[],
) => (searchRequest: SearchRequest): SearchResult => {
  const matchingPrograms = findMatchingPrograms(searchRequest.search);
  const sortedPrograms = programSorter(matchingPrograms, searchRequest);
  return getSearchResultFromSortedPrograms(sortedPrograms, searchRequest);
};

export const repo: ProgramRepo = {
  searchByRelevance: basicSearchWrapper(
    (matchingPrograms: Program[], searchRequest: SearchRequest): Program[] => {
      const programsWithRelevanceScore = R.map(
        (program: Program) => ({
          program,
          relevanceScore: relevanceScorer(searchRequest.search, program),
        }),
        matchingPrograms,
      );

      const sortedPrograms = R.pipe(
        R.sort((
          { relevanceScore: relevanceScoreA },
          { relevanceScore: relevanceScoreB },
        ) => relevanceScoreA - relevanceScoreB),
        R.map(({ program }) => program),
      )(programsWithRelevanceScore);

      return sortedPrograms;
    },
  ),
  searchByCostLowToHigh: basicSearchWrapper(
    (matchingPrograms: Program[]): Program[] => {
      const sortedPrograms = R.sort(
        (
          { annualTuition: annualTuitionA }: Program,
          { annualTuition: annualTuitionB }: Program,
        ) => annualTuitionA - annualTuitionB,
        matchingPrograms,
      );

      return sortedPrograms;
    },
  ),
  searchByCostHighToLow: basicSearchWrapper(
    (matchingPrograms: Program[]): Program[] => {
      const sortedPrograms = R.sort(
        (
          { annualTuition: annualTuitionA }: Program,
          { annualTuition: annualTuitionB }: Program,
        ) => annualTuitionB - annualTuitionA,
        matchingPrograms,
      );

      return sortedPrograms;
    },
  ),
  searchByDuration: basicSearchWrapper(
    (matchingPrograms: Program[]): Program[] => {
      const sortedPrograms = R.sort(
        (
          { durationInDays: durationInDaysA }: Program,
          { durationInDays: durationInDaysB }: Program,
        ) => durationInDaysA - durationInDaysB,
        matchingPrograms,
      );

      return sortedPrograms;
    },
  ),
  searchByDistance: basicSearchWrapper(
    (matchingPrograms: Program[], searchRequest: SearchRequest): Program[] => {
      const programsWithDistanceScore = R.map(
        (program: Program) => ({
          program,
          distanceScore: getDistance(searchRequest.userGeoLocation, program.geoLocation),
        }),
        matchingPrograms,
      );

      const sortedPrograms = R.pipe(
        R.sort((
          { distanceScore: relevanceScoreA },
          { distanceScore: relevanceScoreB },
        ) => relevanceScoreA - relevanceScoreB),
        R.map(({ program }) => program),
      )(programsWithDistanceScore);

      return sortedPrograms;
    },
  ),
};
