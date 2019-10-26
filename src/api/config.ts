import express from 'express';

import { apiConfiguration as searchApiConfiguration } from './search_programs';
import { ApiHttpConfig, RequestValidation } from './core';

import logging from '../core/logging';
import { RequestValidationFailedError } from '../core/errors';

const appConfig: ApiHttpConfig[] = [
  ...searchApiConfiguration,
  // add more configs in the future
];

const logger = logging.getLogger('API_CONFIG');

const hookUpExpressServerToApiConfig = (app): void => {
  appConfig.forEach((apiConfig) => {
    app[apiConfig.httpVerb](apiConfig.route, (req: express.Request, res) => {
      try {
      // validate the request
        let validationErrors = [];
        const requestValidations = apiConfig.requestValidations || [];
        requestValidations.forEach((validation: RequestValidation) => {
          validationErrors = validationErrors.concat(validation.validate(req.params, req.body));
        });

        if (validationErrors.length > 0) {
          throw new RequestValidationFailedError('Validating the search request failed.', validationErrors);
        }

        const result = apiConfig.handler(req.params, req.body);

        res.send({ error: null, result });
      } catch (error) {
        logger.error('Error while executing search', error);

        res.send({ error: error.message, result: null });
      }
    });
  });
};

export default hookUpExpressServerToApiConfig;
