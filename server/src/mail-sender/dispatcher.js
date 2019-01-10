const pLimit = require('p-limit');
const transport = require('./transport');
const logger = require('../logger');
const { composeHTML } = require('./composeMail');
const {
    getActiveUserFeeds, getFeedInfo, getItemsNewerThan, setUserFeedLastUpdate,
} = require('../db-queries');

const limitEmails = pLimit(20);
const hour = process.env.NODE_ENV === 'development' ? 0 : 1000 * 60 * 60;

const periods = {
    REALTIME: 0,
    EVERYHOUR: 1 * hour,
    EVERY2HOURS: 2 * hour,
    EVERY3HOURS: 3 * hour,
    EVERY6HOURS: 6 * hour,
    EVERY12HOURS: 12 * hour,
    DAILY: 24 * hour,
};

/**
 * Make digests and send them if feed with given url has new items
 * and there are users who are waiting for them.
 * @param {string} url - unique feed's url
 */
async function buildAndSendDigests(url) {
    if (!url) return;

    const userFeeds = await getActiveUserFeeds(url);
    const time = Date.now();
    const readyUserFeeds = userFeeds.filter(({ lastUpdate, schedule }) => Date.parse(lastUpdate) <= (time - periods[schedule]));
    if (!readyUserFeeds.length) return;

    const feed = await getFeedInfo(url);

    for (const userFeed of readyUserFeeds) {
        limitEmails(async () => {
            try {
                const items = await getItemsNewerThan(url, userFeed.lastUpdate);
                if (!items.length) return;
                const timestamp = new Date();
                const { html, errors } = composeHTML(feed, items);
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
                logger.error(e);
            }
        });
    }
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
    logger.info(result, 'confirmation email has been sent');
}

module.exports = { buildAndSendDigests, sendConfirmSubscription };
