import type { FlightChangeField } from '@prisma/client';

export const DIGIT_REGEX = /[0-9]/g;
export const PASSWORD_REQUIREMENT_REGEX =
  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,255}$/;
export const PASSWORD_REQUIREMENT_STRING =
  'Password must be at least 8 characters and must include at least one upper case letter, one lower case letter, and one numeric digit.';

export const TIME_REGEX_24H = /^[0-9]{2}:[0-9]{2}$/;
export const DATE_REGEX_ISO = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;

export const DATE_FORMAT = 'iii, MMM d, yyyy';
export const DATE_FORMAT_ABBR = 'iii, MMM d';
export const DATE_FORMAT_MONTH = 'MMMM yyyy';
export const DATE_FORMAT_MONTH_DAY = 'MMM d';
export const DATE_FORMAT_YEAR = 'yyyy';
export const DATE_FORMAT_SHORT = 'M/d';
export const DATE_FORMAT_WITH_DAY = 'EEE, LLL d';
export const DATE_FORMAT_ISO = 'yyyy-MM-dd';
export const TIME_FORMAT_12H = 'h:mm aaa';
export const TIME_FORMAT_24H = 'HH:mm';
export const TIMESTAMP_FORMAT_ISO = `${DATE_FORMAT_ISO}'T'${TIME_FORMAT_24H}:ss'Z'`;
export const ON_TIME_PERFORMANCE_DATE_FORMAT = 'dd-LLL-yyyy';

export const DB_PROMISE_CONCURRENCY = 10;
export const FLIGHT_DATA_PROMISE_CONCURRENCY = 2;

export const METERS_IN_MILE = 1609.344;

export const SECONDS_IN_MINUTE = 60;
export const SECONDS_IN_HOUR = 3600;

export const CHANGE_FIELD_TEXT_MAP: Partial<Record<FlightChangeField, string>> =
  {
    DEPARTURE_AIRPORT: 'Departure Airport',
    ARRIVAL_AIRPORT: 'Arrival Airport',
    DIVERSION_AIRPORT: 'Diversion Airport',
    AIRLINE: 'Airline',
    OPERATOR_AIRLINE: 'Operator Airline',
    FLIGHT_NUMBER: 'Flight No.',
    AIRCRAFT_TYPE: 'Aircraft Type',
    TAIL_NUMBER: 'Airframe',
    CLASS: 'Class',
    SEAT_NUMBER: 'Seat No.',
    SEAT_POSITION: 'Seat Position',
    REASON: 'Reason',
    COMMENTS: 'Comments',
    OUT_TIME: 'Departure Time',
    OFF_TIME: 'Takeoff Time',
    ON_TIME: 'Landing Time',
    IN_TIME: 'Arrival Time',
    OUT_TIME_ACTUAL: 'Departure Time (actual)',
    OFF_TIME_ACTUAL: 'Takeoff Time (actual)',
    ON_TIME_ACTUAL: 'Landing Time (actual)',
    IN_TIME_ACTUAL: 'Arrival Time (actual)',
    DEPARTURE_GATE: 'Departure Gate',
    DEPARTURE_TERMINAL: 'Departure Terminal',
    ARRIVAL_GATE: 'Arrival Gate',
    ARRIVAL_TERMINAL: 'Arrival Terminal',
    ARRIVAL_BAGGAGE: 'Arrival Baggage',
  };

export const CHANGE_FIELD_ESTIMATED_TEXT_MAP: Partial<
  Record<FlightChangeField, string>
> = {
  OUT_TIME_ACTUAL: 'Departure Time (est.)',
  OFF_TIME_ACTUAL: 'Takeoff Time (est.)',
  ON_TIME_ACTUAL: 'Landing Time (est.)',
  IN_TIME_ACTUAL: 'Arrival Time (est.)',
};
