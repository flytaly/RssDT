'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';

import { getGQLClient } from '@/app/gqlClient.client';
import MainCard from '@/app/main-card';
import { MessageItem } from '@/components/main-card/animated-message';
import FormSide from '@/components/main-card/form-side';
import MessagesSide from '@/components/main-card/messages-side';

import { AddDigestFeedForm } from './add-digest-feed-form';

const infoMessages: MessageItem[] = [
  {
    text: 'FeedMailu is an RSS/Atom reader that also can aggregate your feeds into digests and send them to you via email.',
    key: 'intro-message',
  },
  {
    text: 'To start receiving digests just enter an address of the desired feed, email, and digest period',
    key: 'digest-message',
  },
];

const nonLoggedInMessages: MessageItem[] = [
  {
    content: (
      <span>
        <span>To read or manage your feeds </span>
        <Link href="/login" className="underline text-primary">
          log in
        </Link>
        {' or '}
        <Link href="/register" className="underline text-primary">
          register
        </Link>
      </span>
    ),
    key: 'login-reader-message',
  },
];

export default function Page() {
  const { data, isLoading } = useQuery(['me'], async () => getGQLClient().me(), {
    retry: false,
  });
  const email = data?.me?.email;
  const isLoggedOut = !isLoading && !email;
  const [messages, setMessages] = useState<MessageItem[]>([]);

  const items = infoMessages.concat(isLoggedOut ? nonLoggedInMessages : [], messages);

  return (
    <MainCard>
      <MessagesSide items={items} />
      <FormSide>
        <h2 className="text-xl font-bold mb-4 text-center">Add a feed</h2>
        <AddDigestFeedForm email={email} setMessages={setMessages} />
      </FormSide>
    </MainCard>
  );
}
