import { ParamsDictionary } from 'express-serve-static-core';
import { SearchResult, repo as ProgramsRepo, GeoLocation } from '../repos/programs/repo';

/**
 * Handles searching for programs.
 * */


// The various sort types that our API supports
export enum SortType {
  RELEVANCY = 'RELEVANCY',
  COST_LOW_TO_HIGH = 'COST_LOW_TO_HIGH',
  COST_HIGH_TO_LOW = 'COST_HIGH_TO_LOW',
  DISTANCE = 'DISTANCE',
  DURATION = 'DURATION',
}

export interface ProgramApi {
  searchPrograms: (
    search: string,
    length: number,
    offset: number,
    sortType: SortType,
    userGeoLocation?: GeoLocation,
  ) => SearchResult;
}

export enum ExpressHttpVerb {
  GET = 'get',
  POST = 'post',
}

export interface ValidationError {
  message: string;
}

export interface RequestValidation {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validate: (params: ParamsDictionary, body: any) => ValidationError[];
}

export interface ApiHttpConfig {
  httpVerb: ExpressHttpVerb;
  route: string;
  requestValidations?: RequestValidation[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (params: ParamsDictionary, body: any) => object;
}

export const api: ProgramApi = {
  searchPrograms: (
    search: string,
    length: number,
    offset: number,
    sortType: SortType,
    // this design needs to be thought out more. Maybe just pass through fns?
    userGeoLocation: GeoLocation = null,
  ): SearchResult => {
    if (sortType === SortType.RELEVANCY) {
      return ProgramsRepo.searchByRelevance(search, length, offset);
    }

    if (sortType === SortType.COST_HIGH_TO_LOW) {
      return ProgramsRepo.searchByCostHighToLow(search, length, offset);
    }

    if (sortType === SortType.COST_LOW_TO_HIGH) {
      return ProgramsRepo.searchByCostLowToHigh(search, length, offset);
    }

    if (sortType === SortType.DURATION) {
      return ProgramsRepo.searchByDuration(search, length, offset);
    }

    if (sortType === SortType.DISTANCE) {
      return ProgramsRepo.searchByDistance(search, userGeoLocation, length, offset);
    }

    return null;
  },
};

export const apiConfiguration: ApiHttpConfig[] = [
  {
    httpVerb: ExpressHttpVerb.POST,
    route: '/search/relevancy',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler: (params: ParamsDictionary, body: any): object => api.searchPrograms(
      body.search, body.length, body.offset, SortType.RELEVANCY,
    ),
  },
];
