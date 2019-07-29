const moment = require('moment-timezone');
const { periods } = require('./config');
const periodNames = require('../periods');
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
    if (!lastUpdate) return true;
    const timeZone = user.timeZone || 'GMT';
    const lastEmailTime = moment(lastUpdate).tz(timeZone);
    const now = moment().tz(timeZone);
    const hour = now.hour();
    const prevSuitableHour = hour - (hour % periods[schedule]);

    const prevSuitableTime = now.clone().tz(timeZone)
        .set({ hour: prevSuitableHour, minute: 0, second: 0, millisecond: 0 });
    if (schedule === periodNames.DAILY) {
        prevSuitableTime.hour(user.dailyDigestHour);
        if (!prevSuitableTime.isSameOrBefore(now)) {
            prevSuitableTime.subtract(1, 'days');
        }
    }

    if (lastEmailTime.isBefore(prevSuitableTime)) {
        return true;
    }

    return false;
};

module.exports = { isFeedReady };
