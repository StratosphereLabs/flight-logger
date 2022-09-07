import { parse } from 'csv-parse/sync';

export const csvToJson = <Data>(csv: string): Data[] => {
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-call */
  return parse(csv, {
    columns: true,
    skip_empty_lines: true,
  }) as Data[];
};
