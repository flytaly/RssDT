const nodemailer = require('nodemailer');

// This is a temporal solution to deal with debugmail.io expired certificate
const disableTLSInDev = process.env.NODE_ENV === 'development' ? { tls: { rejectUnauthorized: false } } : {};

const transport = nodemailer.createTransport({
    host: process.env.MAIL_SMTP,
    port: process.env.MAIL_PORT,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
    ...disableTLSInDev,
});

module.exports = transport;
