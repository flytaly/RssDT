import { logger } from '../logger';
import { transport } from './transport';

export async function sendConfirmEmail(email: string, token: string, userId: number) {
    const url = `${process.env.FRONTEND_URL}/confirm-register?token=${token}&id=${userId}`;
    const result = await transport.sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject: `Confirm registration`,
        text: `Please, confirm registration: ${url}.
        Ignore this message if you didn't register`,
        html: `Please, confirm registration: <a href="${url}">${url}</a><br><br>
        Ignore this message if you didn't register`,
    });
    logger.info(result, 'registration confirmation email has been sent');
}

export async function sendPasswordReset(email: string, token: string, userId: number) {
    const url = `${process.env.FRONTEND_URL}/reset?token=${token}&id=${userId}`;
    const result = await transport.sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject: 'Reset password',
        text: `A password reset has been requested.

If it was you, visit this link to reset your password: ${url}

Otherwise, ignore this message.`,
        html: `A password reset has been requested.<br>
        If it was you, visit this link to reset your password: <a href="${url}">${url}</a><br><br>
        Otherwise, ignore this message.`,
    });
    logger.info(result, 'rest password email has been sent');
}

/** Send an email to confirm subscription */
export async function sendConfirmSubscription(email: string, token: string, title: string) {
    const url = `${process.env.FRONTEND_URL}/confirm?token=${token}`;
    const result = await transport.sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject: `Confirm subscription to ${title}`,
        text: `Please, confirm subscription to ${title}: ${url}
        Ignore this message if you didn't subscribe`,
        html: `Please, confirm subscription to <b>${title}</b>: <a href="${url}">${url}</a><br><br>
        Ignore this message if you didn't subscribe`,
    });
    logger.info(result, 'feed confirmation email has been sent');
}
