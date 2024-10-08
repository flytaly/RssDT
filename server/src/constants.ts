import { DigestSchedule } from './types/enums.js';

export const IS_PROD = process.env.NODE_ENV === 'production';
export const IS_TEST = process.env.NODE_ENV === 'test';
export const IS_DEV = !IS_PROD && !IS_TEST;

export const COOKIE_NAME = 'qid';
export const EMAIL_CONFIRM_PREFIX = 'email-confirm:';
export const PASSWORD_RESET_PREFIX = 'password-reset:';
export const SUBSCRIPTION_CONFIRM_PREFIX = 'subscription-confirm:';
export const FEED_LOCK_URL_PREFIX = 'lock:';
export const IMPORT_STATUS_PREFIX = 'import:';

export const defaultLocale = 'en-US';
export const defaultTimeZone = 'UTC';

export const maxItemsInFeed = 500;
export const maxItemsInDigest = 100;
export const maxOldItemsInFeed = 30; // maximum number of items that was created more than one week ago
export const maxItemsPerUser = 50;

export const feedUpdateInterval = 1000 * 60 * 10;

export const windowDuration = 3; // hours - duration of the window in which Daily digest could be sent
export const scheduleHours: Record<DigestSchedule, number> = {
  realtime: 0,
  everyhour: 1,
  every2hours: 2,
  every3hours: 3,
  every6hours: 6,
  every12hours: 12,
  daily: 24,
  disable: 0,
};

export const redisUrl = process.env.REDIS_URL;

export const UserAgent =
  'Mozilla/5.0 (X11; Linux x86_64) ' +
  'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36';

export const FAVICON_PREF_W = 32;
export const FAVICON_MIN_W = 16;
export const FAVICON_MAX_W = 96;
export const ICON_PREF_W = 180;
export const ICON_MIN_W = 96;
export const ICON_MAX_W = 400;
