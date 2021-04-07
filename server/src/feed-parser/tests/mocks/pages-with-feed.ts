export const pages = {
  pageWithRSS: {
    url: new URL('https://rss.com/'),
    body:
      '<html><head>' +
      '<link rel="alternate" type="application/rss+xml" title="RSS Feed" href="rss" />' +
      '</head><body></body></html>',
  },
  pageWithAtom: {
    url: new URL('https://atom.com/'),
    body:
      '<html><head>' +
      '<link rel="alternate" type="application/atom+xml" title="Atom Feed" href="atom" />' +
      '</head><body></body></html>',
  },
  pageWithAbsoluteUrl: {
    url: new URL('https://absoluteurl.com/'),
    body:
      '<html><head>' +
      '<link rel="alternate" type="application/rss+xml" title="Rss Feed" href="https://feed.absoluteurl.com/path/to/feed" />' +
      '</head><body></body></html>',
  },
  rssFeed: {
    url: new URL('https://rss.com/rss'),
    body: 'RSS feed body',
  },
  atomFeed: {
    url: new URL('https://atom.com/atom'),
    body: 'Atom feed body',
  },
  absoluteUrlFeed: {
    url: new URL('https://feed.absoluteurl.com/path/to/feed'),
    body: 'absolute path feed',
  },
};
