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
const logger = pino({ name: 'fd' }, logThrough);

// Log to multiple files using a separate process
const child = childProcess.spawn(process.execPath, [
    require.resolve('pino-tee'),
    'warn', `${logPath}/warn.log`,
    'info', `${logPath}/info.log`,
    'error', `${logPath}/error.log`,
    'fatal', `${logPath}/fatal.log`,
], { cwd, env });

logThrough.pipe(child.stdin);

if (env.NODE_ENV === 'development') {
    logThrough.pipe(process.stdout);
}

module.exports = logger;
