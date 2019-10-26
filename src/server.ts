import express from 'express';

import hookUpExpressServerToAppConfig from './api/config';
import config from './core/config';
import logging from './core/logging';

const logger = logging.getLogger('SERVER');

const app = express();
app.use(express.json());

hookUpExpressServerToAppConfig(app);

// start the Express server
app.listen(config.serverPort, () => {
  logger.info(`server started at http://localhost:${config.serverPort}`);
});
