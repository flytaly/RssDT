const moment = require('moment-timezone');

/**
 * Check if current userFeed is ready to receive digest.
 * This function uses time relative to user's time zone.
 *
 * A feed is "ready" when there weren't any emails sent (lastUpdate)
 * past the most recent suitable hour.
 * Suitable hours for "3 hourly digest" schedule are:
 * 0, 3, 6, 9, 12, 15, 18, 21, 24.
 * So if, for instance, time is 15:15 and lastUpdate=14:40
 * then the previous suitable hour is 15 and since 14:40 < 15:00
 * this userFeed is "ready".
 *
 * @param {object} userFeed - graphQL UserFeed object with user reference
 */
const isFeedReady = (userFeed) => {
    const { lastUpdate, schedule, user } = userFeed;
    // TODO: Implement the algorithm described above

    return true;
};

module.exports = { isFeedReady };
