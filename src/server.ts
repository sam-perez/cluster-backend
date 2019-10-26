import http from 'http';
import express from 'express';

import hookUpExpressServerToAppConfig from './api/config';
import config from './core/config';
import logging from './core/logging';

const logger = logging.getLogger('SERVER');

const createServer = (): http.Server => {
  const app = express();
  app.use(express.json());

  hookUpExpressServerToAppConfig(app);

  // start the Express server
  return app.listen(config.serverPort, () => {
    logger.info(`server started at http://localhost:${config.serverPort}`);
  });
};

export default createServer;
