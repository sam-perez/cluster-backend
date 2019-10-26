import { RequestValidationError } from '../core/errors';

export interface ApiHttpConfig {
  httpVerb: ExpressHttpVerb;
  route: string;
  requestValidations?: RequestValidation[];
  handler: (params: Record<string, any>, body: any) => any;
}

export interface RequestValidation {
  validate: (params: Record<string, any>, body: any) => RequestValidationError[];
}

// This seems like a linter error...
// eslint-disable-next-line import/prefer-default-export
export enum ExpressHttpVerb {
  GET = 'get',
  POST = 'post',
}
