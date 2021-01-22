import { GetServerSidePropsContext, NextPage } from 'next';
import React from 'react';
import Layout from '../components/layout/layout';
import { MessageItem } from '../components/welcome-card/animated-message';
import MessagesSide from '../components/welcome-card/messages-side';
import MainCard from '../components/welcome-card/main-card';
import {
  GetFeedInfoByTokenDocument,
  GetFeedInfoByTokenQuery,
  useUnsubscribeByTokenMutation,
} from '../generated/graphql';
import { initializeApollo } from '../lib/apollo-client';

const wrongQueryMsg: MessageItem = {
  key: 'query-error',
  text: 'No token or id provided in the URL',
  type: 'error',
};

type UnsubscribeProps = { id?: string; token?: string; title?: string; url?: string };

const Unsubscribe: NextPage<UnsubscribeProps> = ({ id, token, title, url }) => {
  const [unsubscribeMutation, { called, loading, data, error }] = useUnsubscribeByTokenMutation();
  const messages: MessageItem[] = [];
  if (!id || !token) messages.push(wrongQueryMsg);
  if (error) messages.push({ key: 'error', text: error.message, type: 'error' });
  if (called && !loading) {
    if (data?.unsubscribeByToken) {
      messages.push({ key: 'success', type: 'success', text: 'Successfully unsubscribed' });
    } else {
      const text = "Couldn't unsubscribe. Probably wrong token or id";
      messages.push({ type: 'error', key: 'error_no_success', text });
    }
  }

  const clickHandler = () => {
    if (id && token) unsubscribeMutation({ variables: { id, token } });
  };
  return (
    <Layout>
      <MainCard>
        <div className="flex flex-col items-center w-full h-full text-center p-4 mt-6">
          <div>
            <div>Click on the button to unsubscribe from the feed</div>
            {url ? (
              <a className="font-bold hover:underline" href={url}>
                {title || url}
              </a>
            ) : null}
          </div>
          <button
            type="submit"
            className="btn mt-3"
            onClick={clickHandler}
            disabled={called || loading}
          >
            {loading ? 'Unsubscribing' : ' Unsubscribe'}
          </button>
          <MessagesSide items={messages} />
        </div>
      </MainCard>
    </Layout>
  );
};

const fetchFeedInfo = async (id?: string, token?: string) => {
  if (!id || !token) return { title: '', url: '' };
  const apolloClient = initializeApollo();
  const result = await apolloClient.query<GetFeedInfoByTokenQuery>({
    query: GetFeedInfoByTokenDocument,
    variables: { id, token },
  });
  const feed = result.data.getFeedInfoByToken?.feed;
  return { title: feed?.title || '', url: feed?.url || '' };
};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const { id, token } = context.query as { id?: string; token?: string };
  const { title, url } = await fetchFeedInfo(id, token);
  return { props: { id: id || null, token: token || null, url, title } } as {
    props: UnsubscribeProps;
  };
};

export default Unsubscribe;
