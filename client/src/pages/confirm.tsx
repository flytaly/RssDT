import { GetServerSidePropsContext, NextPage } from 'next';
import React, { useEffect } from 'react';
import Layout from '../components/layout/layout';
import { MessageItem } from '../components/welcome-card/animated-message';
import MessagesSide from '../components/welcome-card/messages-side';
import MainCard from '../components/welcome-card/main-card';
import { ActivateFeedMutation, useActivateFeedMutation } from '../generated/graphql';

type ConfirmFeedProps = { id?: string; token?: string };

const wrongQueryMsg: MessageItem = {
  key: 'query-error',
  text: 'No token or id provided in the URL',
  type: 'error',
};

const getMessages = (data: ActivateFeedMutation): MessageItem[] => {
  const { userFeed, errors } = data.activateFeed;
  if (userFeed)
    return [
      {
        key: 'activation-success',
        text: `Feed ${userFeed.feed.title || userFeed.feed.url} activated successfully`,
        type: 'success',
      },
    ];
  if (errors) {
    return errors.map(({ message }, idx) => ({
      type: 'error',
      text: message,
      key: `error_${idx}`,
    }));
  }
  return [];
};

const ConfirmFeed: NextPage<ConfirmFeedProps> = ({ id, token }) => {
  const [activateFeed, { loading, data, error }] = useActivateFeedMutation();
  const messages: MessageItem[] = [];
  if (!id || !token) messages.push(wrongQueryMsg);
  if (data?.activateFeed) messages.push(...getMessages(data));
  if (error) messages.push({ type: 'error', text: error.message, key: 'graphqlError' });

  useEffect(() => {
    if (token && id) {
      activateFeed({ variables: { token, userFeedId: id } });
    }
  }, [id, token]);

  return (
    <Layout>
      <MainCard>
        <div className="flex flex-col items-center w-full text-center p-4">
          <h2 className="text-xl font-bold mb-4 text-center">Confirm feed</h2>
          {loading ? <b>Confirming</b> : null}
          <MessagesSide items={messages} />
        </div>
      </MainCard>
    </Layout>
  );
};

export const getServerSideProps = (context: GetServerSidePropsContext) => {
  const { id, token } = context.query as { id?: string; token?: string };
  return { props: { id: id || null, token: token || null } } as { props: ConfirmFeedProps };
};

export default ConfirmFeed;
