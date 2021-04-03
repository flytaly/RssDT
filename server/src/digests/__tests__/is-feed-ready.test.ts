import 'reflect-metadata';
import { UserFeed, User, Options } from '#entities';
import { DigestSchedule } from '../../types/enums';
import { isFeedReady } from '../is-feed-ready';
import '../../tests/test-utils/connection';

const dailyDigestHourDefault = 18;
const userFeed = new UserFeed();
const user = new User();
const options = new Options();
options.dailyDigestHour = dailyDigestHourDefault;
user.timeZone = 'UTC';
user.options = options;
userFeed.user = user;

function mockDate(date: string | number | Date) {
  jest.useFakeTimers('modern');
  jest.setSystemTime(new Date(date));
}

afterEach(() => {
  jest.useRealTimers();
});

function feedReadyTest(
  now: string,
  prevDigestTime: string,
  isReady: boolean,
  userFeed_ = userFeed,
) {
  mockDate(now);
  userFeed_.lastDigestSentAt = new Date(prevDigestTime);
  expect(isFeedReady(userFeed_)).toBe(isReady);
}

describe('Check hourly digest feed', () => {
  beforeAll(() => {
    userFeed.schedule = DigestSchedule.everyhour;
  });
  test('should return true', () => {
    feedReadyTest('2020-05-30T23:30:00.00Z', '2020-05-30T22:04:00.00Z', true);
  });
  test('should return false', () => {
    feedReadyTest('2020-05-30T17:22:00.00Z', '2020-05-30T17:00:00.00Z', false);
    feedReadyTest('2020-05-30T17:22:00.00Z', '2020-05-30T17:05:00.00Z', false);
  });
});

describe('Check 2 hourly digest feed', () => {
  beforeAll(() => {
    userFeed.schedule = DigestSchedule.every2hours;
  });
  test('should return true', () => {
    feedReadyTest('2020-05-30T23:30:00.00Z', '2020-05-30T21:04:00.00Z', true);
  });
  test('should return false', () => {
    feedReadyTest('2020-05-30T17:22:00.00Z', '2020-05-30T16:00:00.00Z', false);
    feedReadyTest('2020-05-30T17:22:00.00Z', '2020-05-30T16:05:00.00Z', false);
  });
});

describe('Check 3 hourly digest feed', () => {
  beforeAll(() => {
    userFeed.schedule = DigestSchedule.every3hours;
  });
  test('should return true', () => {
    feedReadyTest('2020-05-30T23:30:00.00Z', '2020-05-30T20:04:00.00Z', true);
  });
  test('should return false', () => {
    feedReadyTest('2020-05-30T17:22:00.00Z', '2020-05-30T15:00:00.00Z', false);
    feedReadyTest('2020-05-30T17:22:00.00Z', '2020-05-30T15:05:00.00Z', false);
  });
});

describe('Check 6 hourly digest feed', () => {
  beforeAll(() => {
    userFeed.schedule = DigestSchedule.every6hours;
  });
  test('should return true', () => {
    feedReadyTest('2020-05-30T23:30:00.00Z', '2020-05-30T15:04:00.00Z', true);
  });
  test('should return false', () => {
    feedReadyTest('2020-05-30T17:22:00.00Z', '2020-05-30T12:00:00.00Z', false);
    feedReadyTest('2020-05-30T17:22:00.00Z', '2020-05-30T12:05:00.00Z', false);
  });
});

describe('Check 12 hourly digest feed', () => {
  beforeAll(() => {
    userFeed.schedule = DigestSchedule.every12hours;
  });
  test('should return true', () => {
    feedReadyTest('2020-05-30T23:30:00.00Z', '2020-05-30T11:04:00.00Z', true);
    feedReadyTest('2020-05-31T04:00:00.00Z', '2020-05-30T12:04:00.00Z', true);
  });
  test('should return false', () => {
    feedReadyTest('2020-05-30T23:30:00.00Z', '2020-05-30T12:00:00.00Z', false);
    feedReadyTest('2020-05-30T23:30:00.00Z', '2020-05-30T12:05:00.00Z', false);
  });
});

describe('Check daily digest feed', () => {
  beforeAll(() => {
    options.dailyDigestHour = dailyDigestHourDefault;
    userFeed.schedule = DigestSchedule.daily;
  });
  afterAll(() => {
    options.dailyDigestHour = dailyDigestHourDefault;
  });
  test('should return true', () => {
    feedReadyTest('2020-05-30T19:30:00.00Z', '2020-05-29T04:04:00.00Z', true);
    feedReadyTest('2020-05-31T18:00:00.00Z', '2020-05-30T18:04:00.00Z', true);
  });
  test('should return false (too late)', () => {
    feedReadyTest('2020-05-30T22:30:00.00Z', '2020-05-28T19:04:00.00Z', false);
    feedReadyTest('2020-05-31T05:00:00.00Z', '2020-05-30T21:04:00.00Z', false);
  });

  test('should return false (too early)', () => {
    feedReadyTest('2020-06-02T14:00:00.00Z', '2020-05-30T18:04:00.00Z', false);
  });

  test('should return false', () => {
    feedReadyTest('2020-05-30T23:30:00.00Z', '2020-05-30T18:04:00.00Z', false);
    feedReadyTest('2020-05-31T16:00:00.00Z', '2020-05-30T18:04:00.00Z', false);
  });
  describe('dailyDigestHour', () => {
    beforeAll(() => {
      options.dailyDigestHour = 13;
    });
    afterAll(() => {
      options.dailyDigestHour = dailyDigestHourDefault;
    });
    test('should return true', () => {
      feedReadyTest('2020-05-30T13:30:00.00Z', '2020-05-29T13:04:00.00Z', true);
      feedReadyTest('2020-05-31T14:00:00.00Z', '2020-05-30T18:04:00.00Z', true);
    });
    test('should return false (too late)', () => {
      feedReadyTest('2020-05-30T18:30:00.00Z', '2020-05-28T19:04:00.00Z', false);
    });
    test('should return false (too early)', () => {
      feedReadyTest('2020-06-02T12:50:00.00Z', '2020-05-30T18:04:00.00Z', false);
    });
  });
});

describe('Check user timezone', () => {
  const dateNow = '2020-05-31T15:40:00.00Z';
  const prevDigestTime = '2020-05-30T18:40:00.00Z';
  beforeAll(() => {
    userFeed.schedule = DigestSchedule.daily;
  });
  test('should return false in Paris (<18:00)', () => {
    userFeed.user.timeZone = 'Europe/Paris';
    feedReadyTest(dateNow, prevDigestTime, false);
  });
  test('should return true in Moscow (>18:00)', () => {
    userFeed.user.timeZone = 'Europe/Moscow';
    feedReadyTest(dateNow, prevDigestTime, true);
  });
});
