import t from 'tcomb-validation';

const NonNegativeInteger = t.refinement(
  t.Number,
  (num) => num >= 0 && Number.isInteger(num),
  'NonNegative Integer',
);

// eslint-disable-next-line
export { NonNegativeInteger };
