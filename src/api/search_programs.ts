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
