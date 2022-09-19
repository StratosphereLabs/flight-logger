import { Options } from 'nodemailer/lib/smtp-transport';

export const nodemailerOptions: Options = {
  host: process.env.MAILTRAP_HOST,
  port: parseInt(process.env.MAILTRAP_PORT ?? '', 10),
  auth: {
    user: process.env.MAILTRAP_USERNAME,
    pass: process.env.MAILTRAP_PASSWORD,
  },
};
