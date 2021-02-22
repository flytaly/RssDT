import { CronJob, CronTime } from 'cron';
import PQueue from 'p-queue';
import { throttleMultiplier } from '../constants';
import { logger } from '../logger';
import { buildAndSendDigests } from '../digests/build-and-send';
import { getFeedsToUpdate, updateFeedData } from './watcher-utils';

type WatcherProps = {
  /** Cron Time */
  cron?: string | Date | moment.Moment;
  /** Number of concurrent connections */
  concurrency?: number;
};

export default class Watcher {
  isUpdating: boolean = false;

  cron: string | Date | moment.Moment = '*/5 * * * *';

  job: CronJob;

  queue: PQueue;

  updating = false;

  constructor({ cron = '*/5 * * * *', concurrency = 10 }: WatcherProps = {}) {
    this.cron = cron;
    this.initJob();
    this.queue = new PQueue({ concurrency, timeout: 1000 * 60 });
  }

  async update() {
    if (this.updating) return;
    this.updating = true;
    logger.info('Start updating...');

    const feeds = await getFeedsToUpdate();
    const now = Date.now();
    let [totalFeeds, totalItems] = [0, 0];
    await this.queue.addAll(
      feeds.map(({ id, url, throttled, lastUpdAttempt }) => async () => {
        if (now > throttleMultiplier * throttled + lastUpdAttempt.getTime()) {
          const [isSuccessful, itemsNum] = await updateFeedData(url);
          if (isSuccessful) {
            totalFeeds += 1;
            totalItems += itemsNum;
          }
        }

        return buildAndSendDigests(id);
      }),
    );
    logger.info({ totalFeeds, totalItems }, 'End updating');
    this.updating = false;
  }

  initJob() {
    const jobCallBack = async () => {
      if (this.isUpdating) return;
      this.isUpdating = true;
      try {
        await this.update();
      } catch (e) {
        logger.error({ message: e.message }, 'Error during updating');
      }
      this.isUpdating = false;
    };

    this.job = new CronJob(this.cron, jobCallBack, null, false, 'UTC');
  }

  start() {
    this.job.start();
    logger.info('Watcher is started');
  }

  cancel() {
    this.job.stop();
    logger.info('Watcher stopped');
  }

  reschedule(time: CronTime) {
    this.job.setTime(time);
  }

  getNextUpdateTime() {
    return this.job.running ? this.job.nextDates() : null;
  }
}

module.exports = Watcher;
