import bunyan from 'bunyan';
import { Stream } from 'stream';
import path from 'path';
import { IS_TEST } from './constants';

const cwd = path.join(__dirname, '..');
const logPath = `${cwd}/log`;

// eslint-disable-next-line import/no-mutable-exports
export let logger: bunyan;

export const initLogFiles = ({ prefix = '', suffix = '', name = '' }) => {
  logger = bunyan.createLogger({
    name: name || 'app',
    // Create stream to void for tests
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
