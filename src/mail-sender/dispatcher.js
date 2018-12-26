const transport = require('./transport');
const logger = require('../logger');
/**
 * If feed with given url has new items and there are users
 * who are waiting for them then send those items
 * @param {object} db - connection to Prisma Binding
 * @param {string} url - unique feed's url
 */
async function sendDigests(db, url) {
    if (!url || !db) return;
    // TODO: implement
}

/**
 * Send an email to confirm subscription
 * @param {string} email - email address
 * @param {string} token - confirmation token
 * @param {string} title - subscription's title
 */
async function sendConfirmSubscription(email, token, title) {
    const result = await transport.sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject: `Confirm subscription to ${title}`,
        text: `Please, confirm subscription to ${title}: ${token}.
        Ignore this message if you didn't subscribe`,
    });
    logger.info(result, 'email has been sent');
}
module.exports = { sendDigests, sendConfirmSubscription };
