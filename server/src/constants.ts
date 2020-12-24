export const IS_PROD = process.env.NODE_ENV === 'production';
export const IS_TEST = process.env.NODE_ENV === 'test';
export const IS_DEV = !IS_PROD && !IS_TEST;

export const COOKIE_NAME = 'qid';
export const EMAIL_CONFIRM_PREFIX = 'email-confirm:';
export const PASSWORD_RESET_PREFIX = 'password-reset:';

export const defaultLocale = 'en-US';
export const defaultTimeZone = 'UTC';

export const throttleMultiplier = 1000 * 60 * 8; // 8 min
export const maxItemsInFeed = 300;
export const maxOldItemsInFeed = 30; // maximum number of items that was created more than one week ago
