import { DateTime } from 'luxon';
// eslint-disable-next-line import/extensions
import { UserFeed } from '#entities';
import { scheduleHours, windowDuration } from '../constants.js';
import { DigestSchedule } from '../types/enums.js';

/**
 * Checks if the current userFeed is ready to be sent as a digest.
 * This function uses time relative to the user's time zone.
 *
 * A feed is "ready" when there weren't any emails sent (lastDigestSentAt)
 * past the most recent suitable hour. Suitable hours for "3 hourly digest"
 * are: 0, 3, 6, 9, 12, 15, 18, 21, 24. So if, for instance, current time is 15:15
 * and lastDigestSentAt=14:40 then the previous suitable hour is 15
 * and since 14:40 < 15:00 this userFeed is "ready".
 */

export let isFeedReady = (userFeed: UserFeed) => {
  const { lastDigestSentAt, schedule, user } = userFeed;
  if (schedule === DigestSchedule.disable) return false;
  if (schedule === DigestSchedule.realtime) return true;

  const zone = user.timeZone || 'GMT';

  const now = DateTime.local().setZone(zone);
  const lastDigestTime = DateTime.fromJSDate(lastDigestSentAt || new Date(0), { zone });
  const prevSuitableHour = now.hour - (now.hour % scheduleHours[schedule]);
  let prevSuitableTime = now //
    .set({ hour: prevSuitableHour, minute: 0, second: 0, millisecond: 0 });

  if (schedule === DigestSchedule.daily) {
    prevSuitableTime = prevSuitableTime.set({ hour: user.options.dailyDigestHour });
    const windowStart = prevSuitableTime;
    const windowEnd = windowStart.plus({ hours: windowDuration });
    if (now < windowStart || now > windowEnd) {
      return false;
    }
    if (prevSuitableTime > now) {
      prevSuitableTime = prevSuitableTime.minus({ days: 1 });
    }
  }

  if (lastDigestTime < prevSuitableTime) {
    return true;
  }

  return false;
};

export function isFeedReadyMock(mock: typeof isFeedReady) {
  isFeedReady = mock;
}
