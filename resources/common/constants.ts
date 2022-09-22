export const API_URL = import.meta.env.VITE_API_URL as string;
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

export const PASSWORD_REQUIREMENT_REGEX =
  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,255}$/;
export const PASSWORD_REQUIREMENT_STRING =
  'Password must be at least 8 characters and must include at least one upper case letter, one lower case letter, and one numeric digit.';
