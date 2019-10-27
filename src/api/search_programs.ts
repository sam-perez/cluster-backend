import t from 'tcomb-validation';
import { SearchResult, repo as ProgramsRepo, SearchRequest } from '../repos/programs/repo';
import { ApiHttpConfig, ExpressHttpVerb, RequestValidation } from './core';
import { UserGeoLocationMissingError, RequestValidationError } from '../core/errors';
import { NonNegativeInteger } from './validators';
import { registerFunctionForMetrics } from '../core/metrics';

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
    searchRequest: SearchRequest,
    sortType: SortType,
  ) => SearchResult;
}

export const api: ProgramApi = {
  // We are only collecting metrics for this main entry point at the moment.
  // We should be able to see how different sort types are doing.
  searchPrograms: registerFunctionForMetrics('SEARCH_PROGRAMS_API', (
    searchRequest: SearchRequest,
    sortType: SortType,
  ): SearchResult => {
    if (sortType === SortType.RELEVANCY) {
      return ProgramsRepo.searchByRelevance(searchRequest);
    }

    if (sortType === SortType.COST_HIGH_TO_LOW) {
      return ProgramsRepo.searchByCostHighToLow(searchRequest);
    }

    if (sortType === SortType.COST_LOW_TO_HIGH) {
      return ProgramsRepo.searchByCostLowToHigh(searchRequest);
    }

    if (sortType === SortType.DURATION) {
      return ProgramsRepo.searchByDuration(searchRequest);
    }

    if (sortType === SortType.DISTANCE) {
      if (searchRequest.userGeoLocation === null) {
        throw new UserGeoLocationMissingError('geoLocation is required for a distance sort.');
      }

      return ProgramsRepo.searchByDistance(searchRequest);
    }

    return null;
  }),
};

/**
 * Leverage the Tcomb library to validate incoming data from the outside world.
 */
const SearchRequestBody = t.struct({
  search: t.String,
  length: NonNegativeInteger,
  offset: NonNegativeInteger,
  userGeoLocation: t.maybe(t.struct({
    latitude: t.Number,
    longitude: t.Number,
  })),
  sortType: t.enums.of([
    SortType.COST_HIGH_TO_LOW,
    SortType.COST_LOW_TO_HIGH,
    SortType.DISTANCE,
    SortType.DURATION,
    SortType.RELEVANCY,
  ]),
});

const searchRequestBodyRequestValidator: RequestValidation = {
  validate: (params, body): RequestValidationError[] => {
    const validationResult = t.validate(body, SearchRequestBody);
    return validationResult.errors.map(
      (validationError) => new RequestValidationError(validationError.message),
    );
  },
};

export const apiConfiguration: ApiHttpConfig[] = [
  {
    httpVerb: ExpressHttpVerb.POST,
    route: '/search',
    handler: (params: Record<string, any>, body: any): SearchResult => {
      const searchRequest: SearchRequest = {
        search: body.search,
        length: body.length,
        offset: body.offset,
        userGeoLocation: body.userGeoLocation || null,
      };

      return api.searchPrograms(searchRequest, body.sortType);
    },
    requestValidations: [searchRequestBodyRequestValidator],
  },
];
