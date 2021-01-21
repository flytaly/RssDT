import { GetServerSidePropsContext, NextPage } from 'next';
import React, { useState } from 'react';
import Layout from '../components/layout/layout';
import { MessageItem } from '../components/welcome-card/animated-message';
import MessagesSide from '../components/welcome-card/messages-side';
import WelcomeCard from '../components/welcome-card/welcome-card';
import { useUnsubscribeByTokenMutation } from '../generated/graphql';

const wrongQueryMsg: MessageItem = {
  key: 'query-error',
  text: 'No token or id provided in the URL',
  type: 'error',
};

type UnsubscribeProps = { id?: string; token?: string };

const Unsubscribe: NextPage<UnsubscribeProps> = ({ id, token }) => {
  const messages: MessageItem[] = [];
  if (!id || !token) messages.push(wrongQueryMsg);
  const [unsubscribeMutation, { called, loading, data, error }] = useUnsubscribeByTokenMutation();
  if (error) messages.push({ key: 'error', text: error.message, type: 'error' });
  if (called && !loading) {
    if (data?.unsubscribeByToken) {
      messages.push({ key: 'success', type: 'success', text: 'Successfully unsubscribed' });
    } else {
      const text = "Couldn't unsubscribe. Probably wrong token or id";
      messages.push({ type: 'error', key: 'error_no_success', text });
    }
  }

  const title = ''; // TODO: FETCH title

  const clickHandler = () => {
    if (id && token) unsubscribeMutation({ variables: { id, token } });
  };
  return (
    <Layout>
      <WelcomeCard>
        <div className="flex flex-col items-center w-full h-full text-center p-4 mt-6">
          <div>
            <div>Click on the button to unsubscribe from the feed</div>
            <b>{title}</b>
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
      </WelcomeCard>
    </Layout>
  );
};

export const getServerSideProps = (context: GetServerSidePropsContext) => {
  const { id, token } = context.query as { id?: string; token?: string };
  return { props: { id: id || null, token: token || null } } as { props: UnsubscribeProps };
};

export default Unsubscribe;
