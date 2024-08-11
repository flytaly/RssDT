import fs from 'fs';
import path /* { dirname } */ from 'path';
// import { fileURLToPath } from 'url';

 
// const __dirname = dirname(fileURLToPath(import.meta.url));

function readXMLFilesInDir(dir: string) {
  const files = fs.readdirSync(path.join(__dirname, dir));

  return files
    .filter((x) => x.endsWith('.xml'))
    .reduce((acc, currentFile) => {
      const data = fs.readFileSync(path.join(__dirname, dir, currentFile), 'utf-8');

      return { ...acc, [currentFile.slice(0, -4)]: data };
    }, {});
}

export type MockFeedName = 'habrahabr' | 'dzone' | 'nytimes';

type FeedMocks = {
  [key in MockFeedName]: string;
};
const basePath = '../../../../static/mock-feeds';
export const mocks = readXMLFilesInDir(`${basePath}/feeds`) as FeedMocks;
export const updatedFeeds = readXMLFilesInDir(`${basePath}/updated`) as FeedMocks;

export const feeds = [
  {
    url: new URL('https://habrahabr.ru/rss/hubs/all'),
    mock: mocks.habrahabr,
    updateMock: updatedFeeds.habrahabr,
    itemsNum: 20,
    itemsNumUpdated: 5,
  },
  {
    url: new URL('http://rss.nytimes.com/services/xml/rss/nyt/World.xml'),
    mock: mocks.nytimes,
    updateMock: updatedFeeds.nytimes,
    itemsNum: 48,
    itemsNumUpdated: 1,
  },
  {
    url: new URL('http://feeds.dzone.com/home'),
    mock: mocks.dzone,
    updateMock: updatedFeeds.dzone,
    itemsNum: 30,
    itemsNumUpdated: 11,
  },
];
