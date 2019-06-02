const pLimit = require('p-limit');
const transport = require('./transport');
const logger = require('../logger');
const { composeHTML } = require('./composeMail');
const {
    getActiveUserFeeds, getFeedInfo, getItemsNewerThan, setUserFeedLastUpdate,
} = require('../db-queries');
const { isFeedReady } = require('./utils');
const { limitEmailsNumber, maxItemsPerMail } = require('./config');

const limitEmails = pLimit(limitEmailsNumber);

/**
 * Make digests and send them if feed with given url has new items
 * and there are users who are waiting for them.
 * @param {string} url - unique feed's url
 */
async function buildAndSendDigests(url) {
    if (!url) return;

    const userFeeds = await getActiveUserFeeds(url);

    if (!userFeeds.length) return;
    const readyUserFeeds = userFeeds.filter(isFeedReady);
    if (!readyUserFeeds.length) return;

    const feed = await getFeedInfo(url);

    await Promise.all(readyUserFeeds.map(userFeed => limitEmails(async () => {
        try {
            const items = await getItemsNewerThan(url, userFeed.lastUpdate, maxItemsPerMail);
            if (!items.length) return;
            const timestamp = new Date();
            const { html, errors } = composeHTML(feed, items, userFeed);
            if (!errors.length) {
                const result = await transport.sendMail({
                    from: process.env.MAIL_FROM,
                    to: userFeed.user.email,
                    subject: `${feed.title}: ${userFeed.schedule} digest`,
                    // text:,
                    html,
                });
                logger.info(result, 'digest email has been sent');
                await setUserFeedLastUpdate(userFeed.id, timestamp);
            }
        } catch (e) {
            logger.error(e.message);
        }
    })));
}

/**
 * Send an email to confirm subscription
 * @param {string} email - email address
 * @param {string} token - confirmation token
 * @param {string} title - subscription's title
 */
async function sendConfirmSubscription(email, token, title) {
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
    logger.info(result, 'confirmation email has been sent');
}

async function sendSetPasswordLink(email, token) {
    const url = `${process.env.FRONTEND_URL}/reset?token=${token}`;
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
    logger.info(result, 'setting password email has been sent');
}

async function sendUnsubscribe(email, token, title) {
    const url = `${process.env.FRONTEND_URL}/confirmunsubscribe?token=${token}`;
    const result = await transport.sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject: 'Confirm that you want to unsubscribe from the feed',
        text: `Somebody (hopefully you) requested to unsubscribe from the feed: ${title}.

If it was you, and you want to unsubscribe visit this link: ${url}

Otherwise, ignore this message.`,
        html: `Somebody (hopefully you) requested to unsubscribe from the feed: <b>${title}</b>.<br><br>
        If it was you, and you want to unsubscribe visit this link : <a href="${url}">${url}</a><br><br>
        Otherwise, ignore this message.`,
    });
    logger.info(result, 'unsubscribe confirmation email has been sent');
}

module.exports = {
    buildAndSendDigests,
    sendConfirmSubscription,
    sendSetPasswordLink,
    sendUnsubscribe,
};
