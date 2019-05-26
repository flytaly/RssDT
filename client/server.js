// This file doesn't go through babel or webpack transformation.
// https://github.com/zeit/next.js/blob/canary/examples/custom-server/server.js

const { createServer } = require('http');
const next = require('next');

const port = parseInt(process.env.PORT, 10) || 8082;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    createServer((req, res) => handle(req, res)).listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${port}`);
    });
});
