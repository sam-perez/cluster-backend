/*
* Simple utility for capturing metrics. We do not really care about how they are handled for now,
* we just want to establish a pattern for reporting the metrics.
*/
import logging from './logging';

const logger = logging.getLogger('FUNCTION_METRICS');

export interface FunctionMetricsListener {
  receiveMetricsForFunctionInvocation: (
    metricName: string,
    fnArgs: any[],
    fnResult: any,
    start: Date,
    end: Date
  ) => void;
}

const FUNCTION_METRICS_LISTENERS: FunctionMetricsListener[] = [];

/**
 * Register a functionMetricsListener. Our assumption is that it will not block the
 * thread for a substantial amount of time. We can only register for now by design.
 * @param functionMetricsListener
 */
export const registerFunctionMetricsListener = (
  functionMetricsListener: FunctionMetricsListener,
): number => FUNCTION_METRICS_LISTENERS.push(functionMetricsListener);

function reportFunctionMetrics(
  metricName: string,
  fnArgs: any[],
  fnResult: any,
  start: Date,
  end: Date,
): void {
  // use setTimeout to make sure we're not blocking. Report eventually.
  setTimeout(
    () => {
      FUNCTION_METRICS_LISTENERS.forEach(
        (listener) => listener.receiveMetricsForFunctionInvocation(
          metricName,
          fnArgs,
          fnResult,
          start,
          end,
        ),
      );
    },
    0,
  );
}

export function registerFunctionForMetrics(
  metricName: string,
  functionToWrap: (...args: any[]) => any,
) {
  return function wrapped(...args): any {
    const start = new Date();
    const result = functionToWrap(...args);
    const end = new Date();

    reportFunctionMetrics(metricName, args, result, start, end);
    return result;
  };
}

export function registerAsyncFunctionForMetrics(
  metricName: string,
  asyncFunctionToWrap: (...args: any[]) => any,
) {
  return async function asyncWrapped(...args): Promise<any> {
    const start = new Date();
    const result = await asyncFunctionToWrap(...args);
    const end = new Date();

    reportFunctionMetrics(metricName, args, result, start, end);
    return result;
  };
}

// default, just log to logger.info
registerFunctionMetricsListener({
  receiveMetricsForFunctionInvocation: (
    metricName: string,
    fnArgs: any[],
    fnResult: any,
    start: Date,
    end: Date,
  ) => {
    // json stringify is a bit brittle, but fine for this example app for now
    logger.info(`METRICS RECIEVED:\n ${JSON.stringify({
      metricName, fnArgs, fnResult, start, end,
    }, null, 4)}`);
  },
});
