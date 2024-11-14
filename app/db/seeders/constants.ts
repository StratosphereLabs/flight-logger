export const LOGGING_INTERVAL = 1000;
export const DB_PROMISE_CONCURRENCY = 10;
export const WIKI_PROMISE_CONCURRENCY = 2;

export const FREIGHTER_AIRCRAFT_REGEX = /F$|Freighter|sharklets/i;
export const ALL_SPACES_REGEX = / /g;

export const IATA_AIRLINE_CODE_REGEX = /[A-Z0-9]{2}/;
export const ICAO_AIRLINE_CODE_REGEX = /[A-Z]{3}/;

export const AIRFRAMES_CSV_URL =
  'https://opensky-network.org/datasets/metadata/aircraftDatabase.csv';
export const AIRFRAMES_CSV_PATH = './app/db/seeders/data/aircraftDatabase.csv';
