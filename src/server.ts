import express from 'express';

import { api as ProgramsApi, SortType } from './api/search_programs';
import config from './core/config';
import logging from './core/logging';

const serverLogger = logging.getLogger('SERVER');

const app = express();
// define a route handler for the default home page
app.get('/', (_req: express.Request, res: express.Response) => {
  res.send('Hello world!');
});

// start the Express server
app.listen(config.serverPort, () => {
  serverLogger.info(`server started at http://localhost:${config.serverPort}`);
});
