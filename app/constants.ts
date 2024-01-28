export const DIGIT_REGEX = /[0-9]/g;
export const PASSWORD_REQUIREMENT_REGEX =
  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,255}$/;
export const PASSWORD_REQUIREMENT_STRING =
  'Password must be at least 8 characters and must include at least one upper case letter, one lower case letter, and one numeric digit.';

export const TIME_REGEX_24H = /^[0-9]{2}:[0-9]{2}$/;
export const DATE_REGEX_ISO = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;

export const DATE_FORMAT = 'iii, MMM d, yyyy';
export const DATE_FORMAT_MONTH = 'MMMM yyyy';
export const DATE_FORMAT_SHORT = 'M/d';
export const DATE_FORMAT_ISO = 'yyyy-MM-dd';
export const TIME_FORMAT_12H = 'h:mm aaa';
export const TIME_FORMAT_24H = 'HH:mm';

export const EARTH_RADIUS_NM = 3440.065;
