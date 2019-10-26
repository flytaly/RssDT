const pino = require('pino');
const childProcess = require('child_process');
const stream = require('stream');
const path = require('path');

// const cwd = process.cwd();
const cwd = path.join(__dirname, '..');
const { env } = process;
const logPath = `${cwd}/log`;

// Create a stream where the logs will be written
const logThrough = new stream.PassThrough();
const logger = pino(logThrough);

// Log to multiple files using a separate process
const initLogFiles = (prefix = '', suffix = '') => {
    if (env.NODE_ENV !== 'test') {
        const child = childProcess.spawn(process.execPath, [
            require.resolve('pino-tee'),
            'warn', `${logPath}/${prefix}warn${suffix}.log`,
            'info', `${logPath}/${prefix}info${suffix}.log`,
            'error', `${logPath}/${prefix}error${suffix}.log`,
            'fatal', `${logPath}/${prefix}fatal${suffix}.log`,
        ], { cwd, env });

        logThrough.pipe(child.stdin);

        if (env.NODE_ENV === 'development') {
            logThrough.pipe(process.stdout);
        }
    }
};

module.exports = {
    logger,
    initLogFiles,
};
