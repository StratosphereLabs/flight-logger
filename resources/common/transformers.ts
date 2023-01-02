import { Transform } from 'stratosphere-ui';

export const numberInputTransformer: Transform<number | null> = {
  input: value => (value !== null ? value.toString() : ''),
  output: value => (value.length > 0 ? parseInt(value) : null),
};

export const nullEmptyStringTransformer: Transform<string | null> = {
  input: value => (value !== null ? value : ''),
  output: value => (value.length > 0 ? value : null),
};
