import pino from 'pino';
import childProcess from 'child_process';
import stream from 'stream';
import path from 'path';
import fs from 'fs';
import { IS_DEV, IS_TEST } from './constants';

// const cwd = process.cwd();
const cwd = path.join(__dirname, '..');
const { env } = process;
const logPath = `${cwd}/log`;
if (!fs.existsSync(logPath)) {
    fs.mkdirSync(logPath);
}

// Create a stream where the logs will be written
const logThrough = new stream.PassThrough();
export const logger = pino(logThrough);

// Log to multiple files using a separate process
export const initLogFiles = (prefix = '', suffix = '') => {
    if (!IS_TEST) {
        const child = childProcess.spawn(
            process.execPath,
            [
                require.resolve('pino-tee'),
                'warn',
                `${logPath}/${prefix}warn${suffix}.log`,
                'info',
                `${logPath}/${prefix}info${suffix}.log`,
                'error',
                `${logPath}/${prefix}error${suffix}.log`,
                'fatal',
                `${logPath}/${prefix}fatal${suffix}.log`,
            ],
            { cwd, env },
        );

        logThrough.pipe(child.stdin);
        if (IS_DEV) {
            logThrough.pipe(process.stdout);
        }
    }
};
