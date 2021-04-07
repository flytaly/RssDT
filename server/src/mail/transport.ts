import nodemailer, { Transporter } from 'nodemailer';
import { IS_TEST } from '../constants.js';

export let transport = nodemailer.createTransport({
  port: +process.env.MAIL_PORT!,
  host: process.env.MAIL_SMTP,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  ignoreTLS: IS_TEST,
});

export const transportMock = (mock: Partial<Transporter>) => {
  transport = mock as Transporter;
};
