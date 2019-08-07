const limitEmailsNumber = 20;
const maxItemsPerMail = 400;

const hour = process.env.NODE_ENV === 'development' ? 0 : 1000 * 60 * 60;

const periodsByDuration = {
    REALTIME: 0,
    EVERYHOUR: 1 * hour,
    EVERY2HOURS: 2 * hour,
    EVERY3HOURS: 3 * hour,
    EVERY6HOURS: 6 * hour,
    EVERY12HOURS: 12 * hour,
    DAILY: 24 * hour,
};

const periods = {
    REALTIME: 0,
    EVERYHOUR: 1,
    EVERY2HOURS: 2,
    EVERY3HOURS: 3,
    EVERY6HOURS: 6,
    EVERY12HOURS: 12,
    DAILY: 24,
};
const defaultDailyDigestHour = 18;
const windowDuration = 3; // hours - duration of the window in which Daily digest could be sent

module.exports = {
    limitEmailsNumber,
    maxItemsPerMail,
    periodsByDuration,
    periods,
    defaultDailyDigestHour,
    windowDuration,
};
