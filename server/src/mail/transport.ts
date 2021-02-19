import nodemailer from 'nodemailer';
import { IS_TEST } from '../constants';

export const transport = nodemailer.createTransport({
  port: +process.env.MAIL_PORT!,
  host: process.env.MAIL_SMTP,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  ignoreTLS: IS_TEST,
});
