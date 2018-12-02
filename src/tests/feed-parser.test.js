/* eslint-env jest */
const nock = require('nock');
const axios = require('axios');
const httpAdapter = require('axios/lib/adapters/http');
const { Readable } = require('stream');
const { URL } = require('url');
const { feeds, updatedFeeds } = require('./mocks/feeds');
const {
    getNewItems, getFeedStream, parseFeed, isFeed,
} = require('../feed-parser');

axios.defaults.adapter = httpAdapter;

const feedUrls = [
    { url: new URL('https://habrahabr.ru/rss/hubs/all'), mock: 'habrahabr' },
    { url: new URL('http://rss.nytimes.com/services/xml/rss/nyt/World.xml'), mock: 'nytimes' },
    { url: new URL('http://feeds.dzone.com/home'), mock: 'dzone' },
];

describe('Test feed stream', () => {
    const { url, mock } = feedUrls[0];

    beforeAll(() => {
        nock(url.origin)
            .persist()
            .get(url.pathname)
            .reply(200, feeds[mock]);
    });

    afterAll(() => {
        nock.cleanAll();
    });

    it('should have pipe method', async () => {
        const feedStream = await getFeedStream(url.href);
        expect(feedStream.statusCode).toBe(200);
        expect(typeof feedStream.pipe).toBe('function');
    });

    it('should emit raw feed body', async () => {
        const feedStream = await getFeedStream(url.href);
        let feedBody = '';
        feedStream.on('data', (chunk) => {
            feedBody += chunk;
        });
        feedStream.on('end', () => {
            expect(feedBody).toBe(feeds[mock]);
        });
    });
});

describe('Test feed parser', () => {
    beforeEach(() => {
        feedUrls.forEach(({ url, mock }) => {
            nock(url.origin)
                .get(url.pathname)
                .reply(200, feeds[mock])
                .get(url.pathname)
                .once()
                .reply(200, updatedFeeds[mock]);
        });
    });

    afterEach(() => {
        nock.cleanAll();
    });

    feedUrls.forEach(({ url }) => {
        it(`should return array of feeds ${url.hostname}`, async () => {
            const feedStream = await getFeedStream(url.href);

            const feed = await parseFeed(feedStream);
            expect(Array.isArray(feed)).toBeTruthy();
            expect(feed[0]).toHaveProperty('title');
            expect(feed[0]).toHaveProperty('description');
            expect(feed[0]).toHaveProperty('pubDate');
        });
    });

    feedUrls.forEach(({ url }) => {
        it(`should return only new items after update ${url.hostname}`, async () => {
            const feed = await getNewItems(url.href);
            const feedUpdate = await getNewItems(url.href, feed);
            const intersect = feedUpdate.filter(({ pubDate }) => feed[feed.length - 1].pubDate > pubDate);
            expect(feed.length).not.toBe(0);
            expect(feedUpdate.length).not.toBe(0);
            expect(intersect.length).toBe(0);
        });
    });
});

describe('Test isFeed function', () => {
    const { url, mock } = feedUrls[0];
    nock(url.origin)
        .persist()
        .get(url.pathname)
        .reply(200, feeds[mock]);
    afterAll(() => {
        nock.cleanAll();
    });

    it(`should be a feed ${url.href}`, async () => {
        const feedStream = await getFeedStream(url.href);
        expect(await isFeed(feedStream)).toBeTruthy();
    });

    it('should be broken but still a feed', async () => {
        const stream = new Readable();
        stream.push('<?xml version="1.0"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><item><title>Test</title></item>');
        stream.push(null);
        expect(await isFeed(stream)).toBeTruthy();
    });

    it('should not be a feed', async () => {
        const stream = new Readable();
        stream.push('<?xml version="1.0"?>Totally not a feed');
        stream.push(null);
        expect(await isFeed(stream)).toBeFalsy();
    });
});
