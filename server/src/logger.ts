import bunyan from 'bunyan';
import { Stream } from 'stream';
import { IS_TEST } from './constants.js';

const logPath = `./log`;

export let logger: bunyan;

if (IS_TEST) {
  logger = bunyan.createLogger({
    name: 'test',
    // Create stream to void for tests
    stream: IS_TEST ? new Stream.Writable({ write: () => {} }) : undefined,
  });
}

export const initLogFiles = ({ prefix = '', suffix = '', name = '' } = {}) => {
  logger = bunyan.createLogger({
    name: name || 'app',
    stream: IS_TEST ? new Stream.Writable({ write: () => {} }) : undefined,
  });

  if (!IS_TEST) {
    const streams: bunyan.Stream[] = [
      { level: 'info', path: `${logPath}/${prefix}info${suffix}.log` },
      { level: 'error', path: `${logPath}/${prefix}error${suffix}.log` },
      { level: 'warn', path: `${logPath}/${prefix}warn${suffix}.log` },
    ];
    streams.forEach((stream) => logger.addStream(stream));
  }
};

process.on('SIGUSR2', () => logger.reopenFileStreams());
