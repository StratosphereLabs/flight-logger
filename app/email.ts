import nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer/lib/smtp-transport';
import { nodemailerOptions } from './constants';

export interface SendEmailOptions {
  address: string;
  subject: string;
  text?: string;
  html?: string;
}

export const sendEmail = async ({
  address,
  subject,
  text,
  html,
}: SendEmailOptions): Promise<SentMessageInfo | null> => {
  const transporter = nodemailer.createTransport(nodemailerOptions);
  const info = await transporter.sendMail({
    from: '"Flight Logger" <noreply@flightlogger.stratospherelabs.io>',
    to: address,
    subject,
    text,
    html,
  });
  return info;
};
