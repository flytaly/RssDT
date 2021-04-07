module.exports = [
  {
    // will fail without node if `"type": "module"` specified in package.json
    script: 'node dist/index.js',
    name: 'api',
  },
  {
    script: 'node dist/feed-watcher/start-watcher.js',
    name: 'watcher',
  },
];
