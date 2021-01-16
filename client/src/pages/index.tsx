import { NextPage } from 'next';
import Link from 'next/link';
import React, { useState } from 'react';
import AddFeedForm from '../components/forms/add-feed-form';
import Layout from '../components/layout/layout';
import { MessageItem } from '../components/welcome-card/animated-message';
import FormSide from '../components/welcome-card/form-side';
import MessagesSide from '../components/welcome-card/messages-side';
import WelcomeCard from '../components/welcome-card/welcome-card';
import { useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/is-server';

const initialMessages: MessageItem[] = [
  {
    text:
      'FeedMailu is an RSS/Atom reader that also can aggregate your feeds into digests and send them to you via email.',
    key: 'intro-message',
  },
  {
    text:
      'To start receiving digests just enter an address of the desired feed, email, and digest period',
    key: 'digest-message',
  },
  {
    content: (
      <span>
        <span>To read or manage your feeds </span>
        <Link href="/login">
          <a className="underline text-primary">log in</a>
        </Link>
        {' or '}
        <Link href="/register">
          <a className="underline text-primary">register</a>
        </Link>
      </span>
    ),
    key: 'login-reader-message',
  },
];

const Home: NextPage = () => {
  const { data } = useMeQuery({ skip: isServer() });
  const [messages, setMessages] = useState<MessageItem[]>([]);
  return (
    <Layout>
      <WelcomeCard>
        <MessagesSide items={[...initialMessages, ...messages]} />
        <FormSide>
          <h2 className="text-xl font-bold mb-4 text-center">Add a feed</h2>
          <AddFeedForm email={data?.me?.email} setMessages={setMessages} />
        </FormSide>
      </WelcomeCard>
    </Layout>
  );
};

export default Home;
