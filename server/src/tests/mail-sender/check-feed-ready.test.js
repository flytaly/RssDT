const { isFeedReady } = require('../../mail-sender/is-feed-ready');
const periods = require('../../periods');

const mockUserFeed = {
    lastUpdate: new Date(),
    schedule: periods.EVERY3HOURS,
    user: { timeZone: 'GMT', dailyDigestHour: 18 },
};

// Mock Date
const RealDate = Date;
function mockDate(mockDateNow) {
    global.Date = class extends RealDate {
        constructor(...args) {
            if (!args.length) {
                return new RealDate(mockDateNow);
            }
            return new RealDate(...args);
        }

        static now() {
            return (new RealDate(mockDateNow)).getTime();
        }
    };
}
afterEach(() => {
    global.Date = RealDate;
});

describe('Check hourly digest feed', () => {
    beforeAll(() => { mockUserFeed.schedule = periods.EVERYHOUR; });
    test('should return true', () => {
        mockDate('2019-05-30T23:30:00.00Z');
        mockUserFeed.lastUpdate = '2019-05-30T22:04:00.00Z';
        expect(isFeedReady(mockUserFeed)).toBeTruthy();
    });
    test('should return false', () => {
        mockDate('2019-05-30T17:22:00.00Z');
        mockUserFeed.lastUpdate = '2019-05-30T17:00:00.00Z';
        expect(isFeedReady(mockUserFeed)).toBeFalsy();
        mockUserFeed.lastUpdate = '2019-05-30T17:05:00.00Z';
        expect(isFeedReady(mockUserFeed)).toBeFalsy();
    });
});

describe('Check 2 hourly digest feed', () => {
    beforeAll(() => { mockUserFeed.schedule = periods.EVERY2HOURS; });
    test('should return true', () => {
        mockDate('2019-05-30T23:30:00.00Z');
        mockUserFeed.lastUpdate = '2019-05-30T21:04:00.00Z';
        expect(isFeedReady(mockUserFeed)).toBeTruthy();
    });
    test('should return false', () => {
        mockDate('2019-05-30T17:22:00.00Z');
        mockUserFeed.lastUpdate = '2019-05-30T16:00:00.00Z';
        expect(isFeedReady(mockUserFeed)).toBeFalsy();
        mockUserFeed.lastUpdate = '2019-05-30T16:05:00.00Z';
        expect(isFeedReady(mockUserFeed)).toBeFalsy();
    });
});

describe('Check 3 hourly digest feed', () => {
    beforeAll(() => { mockUserFeed.schedule = periods.EVERY3HOURS; });
    test('should return true', () => {
        mockDate('2019-05-30T23:30:00.00Z');
        mockUserFeed.lastUpdate = '2019-05-30T20:04:00.00Z';
        expect(isFeedReady(mockUserFeed)).toBeTruthy();
    });
    test('should return false', () => {
        mockDate('2019-05-30T17:22:00.00Z');
        mockUserFeed.lastUpdate = '2019-05-30T15:00:00.00Z';
        expect(isFeedReady(mockUserFeed)).toBeFalsy();
        mockUserFeed.lastUpdate = '2019-05-30T15:05:00.00Z';
        expect(isFeedReady(mockUserFeed)).toBeFalsy();
    });
});

describe('Check 6 hourly digest feed', () => {
    beforeAll(() => { mockUserFeed.schedule = periods.EVERY6HOURS; });
    test('should return true', () => {
        mockDate('2019-05-30T23:30:00.00Z');
        mockUserFeed.lastUpdate = '2019-05-30T15:04:00.00Z';
        expect(isFeedReady(mockUserFeed)).toBeTruthy();
    });
    test('should return false', () => {
        mockDate('2019-05-30T17:22:00.00Z');
        mockUserFeed.lastUpdate = '2019-05-30T12:00:00.00Z';
        expect(isFeedReady(mockUserFeed)).toBeFalsy();
        mockUserFeed.lastUpdate = '2019-05-30T12:05:00.00Z';
        expect(isFeedReady(mockUserFeed)).toBeFalsy();
    });
});

describe('Check 12 hourly digest feed', () => {
    beforeAll(() => { mockUserFeed.schedule = periods.EVERY12HOURS; });
    test('should return true', () => {
        mockDate('2019-05-30T23:30:00.00Z');
        mockUserFeed.lastUpdate = '2019-05-30T11:04:00.00Z';
        expect(isFeedReady(mockUserFeed)).toBeTruthy();

        mockDate('2019-05-31T04:00:00.00Z');
        mockUserFeed.lastUpdate = '2019-05-30T12:04:00.00Z';
        expect(isFeedReady(mockUserFeed)).toBeTruthy();
    });
    test('should return false', () => {
        mockDate('2019-05-30T23:30:00.00Z');
        mockUserFeed.lastUpdate = '2019-05-30T12:00:00.00Z';
        expect(isFeedReady(mockUserFeed)).toBeFalsy();
        mockUserFeed.lastUpdate = '2019-05-30T12:05:00.00Z';
        expect(isFeedReady(mockUserFeed)).toBeFalsy();
    });
});

describe('Check daily digest feed', () => {
    beforeAll(() => { mockUserFeed.schedule = periods.DAILY; });
    test('should return true', () => {
        mockDate('2019-05-30T19:30:00.00Z');
        mockUserFeed.lastUpdate = '2019-05-29T04:04:00.00Z';
        expect(isFeedReady(mockUserFeed)).toBeTruthy();

        mockDate('2019-05-31T18:00:00.00Z');
        mockUserFeed.lastUpdate = '2019-05-30T18:04:00.00Z';
        expect(isFeedReady(mockUserFeed)).toBeTruthy();
    });
    test('should return false if it\'s too late', () => {
        mockDate('2019-05-30T22:30:00.00Z');
        mockUserFeed.lastUpdate = '2019-05-29T04:04:00.00Z';
        expect(isFeedReady(mockUserFeed)).toBeFalsy();

        mockDate('2019-05-31T14:00:00.00Z');
        mockUserFeed.lastUpdate = '2019-05-30T18:04:00.00Z';
        expect(isFeedReady(mockUserFeed)).toBeFalsy();
    });

    test('should return false', () => {
        mockDate('2019-05-30T23:30:00.00Z');
        mockUserFeed.lastUpdate = '2019-05-30T18:04:00.00Z';
        expect(isFeedReady(mockUserFeed)).toBeFalsy();

        mockDate('2019-05-31T16:00:00.00Z');
        mockUserFeed.lastUpdate = '2019-05-30T18:04:00.00Z';
        expect(isFeedReady(mockUserFeed)).toBeFalsy();
    });
});

describe('Check user timezone', () => {
    const dateStr = '2019-05-31T15:40:00.00Z';
    beforeAll(() => {
        mockUserFeed.schedule = periods.DAILY;
        mockUserFeed.lastUpdate = '2019-05-30T18:40:00.00Z';
    });
    test('should return false in Paris (<18:00)', () => {
        mockDate(dateStr);
        mockUserFeed.user.timeZone = 'Europe/Paris';
        expect(isFeedReady(mockUserFeed)).toBeFalsy();
    });
    test('should return true in Moscow (>18:00)', () => {
        mockDate(dateStr);
        mockUserFeed.user.timeZone = 'Europe/Moscow';
        expect(isFeedReady(mockUserFeed)).toBeTruthy();
    });
});
