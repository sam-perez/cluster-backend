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
  searchByRelevance: (search: string, length: number, offset: number) => SearchResult;
  searchByCostLowToHigh: (search: string, length: number, offset: number) => SearchResult;
  searchByCostHighToLow: (search: string, length: number, offset: number) => SearchResult;
  searchByDuration: (search: string, length: number, offset: number) => SearchResult;
  /*
  searchByDistance: (
    search: string,
    userGeoLocation: GeoLocation,
    length: number,
    offset: number
  ) => SearchResult;
  */
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // eslint-disable-next-line no-underscore-dangle
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
  length: number,
  offset: number,
): SearchResult => ({
  totalNumberOfMatchingPrograms: sortedPrograms.length,
  programs: sortedPrograms.slice(offset, offset + length),
});

export const repo: ProgramRepo = {
  searchByRelevance: (search: string, length: number, offset: number): SearchResult => {
    const matchingPrograms = findMatchingPrograms(search);

    type ProgramWithRelevanceScore = { relevanceScore: number; program: Program };

    const programsWithRelevanceScore = R.map(
      (program: Program): ProgramWithRelevanceScore => ({
        program,
        relevanceScore: relevanceScorer(search, program),
      }),
      matchingPrograms,
    );

    const sortedPrograms = R.pipe(
      R.sort((
        { relevanceScore: relevanceScoreA }: ProgramWithRelevanceScore,
        { relevanceScore: relevanceScoreB }: ProgramWithRelevanceScore,
      ) => relevanceScoreA - relevanceScoreB),
      R.map(({ program }: ProgramWithRelevanceScore) => program),
    )(programsWithRelevanceScore);

    return getSearchResultFromSortedPrograms(sortedPrograms, length, offset);
  },
  searchByCostLowToHigh: (search: string, length: number, offset: number): SearchResult => {
    const matchingPrograms = findMatchingPrograms(search);

    const sortedPrograms = R.sort(
      (
        { annualTuition: annualTuitionA }: Program,
        { annualTuition: annualTuitionB }: Program,
      ) => annualTuitionA - annualTuitionB,
      matchingPrograms,
    );

    return getSearchResultFromSortedPrograms(sortedPrograms, length, offset);
  },
  searchByCostHighToLow: (search: string, length: number, offset: number): SearchResult => {
    const matchingPrograms = findMatchingPrograms(search);

    const sortedPrograms = R.sort(
      (
        { annualTuition: annualTuitionA }: Program,
        { annualTuition: annualTuitionB }: Program,
      ) => annualTuitionB - annualTuitionA,
      matchingPrograms,
    );

    return getSearchResultFromSortedPrograms(sortedPrograms, length, offset);
  },
  searchByDuration: (search: string, length: number, offset: number): SearchResult => {
    const matchingPrograms = findMatchingPrograms(search);

    const sortedPrograms = R.sort(
      (
        { durationInDays: durationInDaysA }: Program,
        { durationInDays: durationInDaysB }: Program,
      ) => durationInDaysA - durationInDaysB,
      matchingPrograms,
    );

    return getSearchResultFromSortedPrograms(sortedPrograms, length, offset);
  },
};
