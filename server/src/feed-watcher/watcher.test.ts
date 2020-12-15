/* eslint-env jest */
import moment from 'moment';
import Watcher from './watcher';

describe('Feed watcher', () => {
    test("should create watcher's instance that has managing methods", () => {
        const feedWatcher = new Watcher();
        feedWatcher.start();
        expect(moment.isMoment(feedWatcher.getNextUpdateTime())).toBeTruthy();

        feedWatcher.cancel();
        expect(feedWatcher.getNextUpdateTime()).toBeNull();
    });

    test('should call update every fixed amount of time', async () => {
        const feedWatcher = new Watcher({ cron: '*/1 * * * * *' }); // update every second
        feedWatcher.update = jest.fn(async () => {});
        feedWatcher.start();
        await new Promise((resolve) => setTimeout(resolve, 2000));
        feedWatcher.cancel();
        expect(feedWatcher.update).toHaveBeenCalledTimes(2);
    });
});
