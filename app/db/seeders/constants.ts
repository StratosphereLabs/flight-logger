export const LOGGING_INTERVAL = 1000;
export const DB_PROMISE_CONCURRENCY = 10;
export const WIKI_PROMISE_CONCURRENCY = 2;

export const READ_AIRFRAMES_CHUNK_SIZE = 100;

export const FREIGHTER_AIRCRAFT_REGEX = /F$|Freighter|sharklets/i;

export const IATA_AIRLINE_CODE_REGEX = /[A-Z0-9]{2}/;
export const ICAO_AIRLINE_CODE_REGEX = /[A-Z]{3}/;

export const AIRFRAMES_CSV_URL =
  'https://s3.opensky-network.org/data-samples/metadata/aircraft-database-complete-2025-02.csv';
export const AIRFRAMES_CSV_PATH = './app/db/seeders/data/aircraftDatabase.csv';
