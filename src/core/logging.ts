/*
 Shim for our logging. Since this is a simple coding challenge,
 we only log to the console. Could layer in some external logging library,
 like Rollbar, Sentry, etc...
*/

export interface ClusterLogger {
  info: (message: string) => void;
  error: (message: string, error: Error) => void;
  warn: (message: string) => void;
}

const logging = {
  getLogger: (namespace: string): ClusterLogger => {
    const { log, error: logError, warn } = console;

    return {
      info: (message: string): void => log(`${namespace}: ${message}`),
      error: (message: string, error: Error): void => logError(`${namespace}: ${message}`, error),
      warn: (message: string): void => warn(`${namespace}: ${message}`),
    };
  },
};

export default logging;
