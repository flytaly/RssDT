import { NextPage } from 'next';
import opml from 'opml-generator';
import React from 'react';
import { ImportForm } from '../components/import-form';
import Layout from '../components/layout/layout';
import FeedNavBar from '../components/main-card/feed-nav-bar';
import MainCard from '../components/main-card/main-card';
import Spinner from '../components/spinner';
import { DigestSchedule, useMyFeedsQuery, UserFeed } from '../generated/graphql';
import useRedirectUnauthorized from '../hooks/use-auth-route';

function downloadText(text: string, filename = 'file.txt', type = 'plain') {
  const element = document.createElement('a');
  const file = new Blob([text], {
    type: `text/${type};charset=utf-8`,
  });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
}

const ImportExport: NextPage = () => {
  useRedirectUnauthorized();
  const { data, loading } = useMyFeedsQuery({ ssr: false });

  const myFeeds = React.useMemo(() => {
    if (!data?.myFeeds) return [] as UserFeed[];
    return [...data.myFeeds].sort((a, b) => {
      if (a.feed.url < b.feed.url) return -1;
      if (a.feed.url > b.feed.url) return 1;
      return 0;
    }) as UserFeed[];
  }, [data?.myFeeds]);

  const exportText = () => downloadText(myFeeds.map((f) => f.feed.url).join('\n'), 'feeds.txt');

  const exportOPML = () => {
    const generated = opml(
      { title: 'Subscriptions' },
      myFeeds.map((f) => {
        const digest = f.schedule && f.schedule !== DigestSchedule.Disable;
        return {
          xmlUrl: f.feed.url,
          title: f.title || f.feed.title || undefined,
          ...(digest ? { digest_schedule: f.schedule } : {}),
        };
      }),
    );
    downloadText(generated, 'feeds.xml', 'xml');
  };

  return (
    <Layout>
      <MainCard big onlyWithVerifiedEmail>
        <div className="w-full ">
          <FeedNavBar />
          <div className="flex flex-col sm:flex-row w-full max-w-5xl p-4 mx-auto">
            <div className="flex-1 p-3">
              <h2 className="font-bold text-base text-center">Import</h2>
              <ImportForm />
            </div>
            <div className="flex-1 p-3">
              <h2 className="font-bold text-base text-center">Export</h2>
              <ul className="py-4">
                <li>
                  <b>Export as text</b> - export feeds as text file with one feed&apos;s url per
                  line.
                </li>
                <li>
                  <b>Export as OPML</b> - export feeds as OPML file.
                </li>
              </ul>
              {loading ? (
                <Spinner />
              ) : (
                <div>
                  <button type="button" className="btn bg-secondary mr-4" onClick={exportText}>
                    Export as text
                  </button>
                  <button type="button" className="btn bg-secondary mr-4" onClick={exportOPML}>
                    Export as OPML
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </MainCard>
    </Layout>
  );
};

export default ImportExport;
