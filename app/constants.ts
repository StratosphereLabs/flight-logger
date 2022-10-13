import { Options } from 'nodemailer/lib/smtp-transport';

export const nodemailerOptions: Options = {
  host: process.env.MAILTRAP_HOST,
  port: parseInt(process.env.MAILTRAP_PORT ?? '', 10),
  auth: {
    user: process.env.MAILTRAP_USERNAME,
    pass: process.env.MAILTRAP_PASSWORD,
  },
};

export const DIGIT_REGEX = /[0-9]/g;
export const PASSWORD_REQUIREMENT_REGEX =
  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,255}$/;
export const PASSWORD_REQUIREMENT_STRING =
  'Password must be at least 8 characters and must include at least one upper case letter, one lower case letter, and one numeric digit.';
