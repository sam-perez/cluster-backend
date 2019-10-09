// Shim for our logging. Since this is a simple coding challenge, we only log to the console

export interface ClusterLogger {
  info: (message: string) => void;
  error: (message: string) => void;
  warn: (message: string) => void;
}

const logging = {
  getLogger: (namespace: string): ClusterLogger => {
    const { log, error, warn } = console;

    return {
      info: (message: string): void => log(`${namespace}: ${message}`),
      error: (message: string): void => error(`${namespace}: ${message}`),
      warn: (message: string): void => warn(`${namespace}: ${message}`),
    };
  },
};

export default logging;
