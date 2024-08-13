'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';

import { MessageItem } from '@/components/card/animated-message';
import FormSide from '@/components/card/form-side';
import MessagesSide from '@/components/card/messages-side';
import SmallCard from '@/components/card/small-card';
import { getGQLClient } from '@/lib/gqlClient.client';

import { AddDigestFeedForm } from './add-digest-form';

const infoMessages: MessageItem[] = [
  {
    text: 'RssDT is an RSS/Atom reader that also can aggregate your feeds into digests and send them to you via email.',
    key: 'intro-message',
    static: true,
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
  const { data, isPending } = useQuery({
    queryKey: ['me'],
    queryFn: async () => getGQLClient().me(),
    retry: false,
  });
  const email = data?.me?.email;
  const isLoggedOut = !isPending && !email;
  const [messages, setMessages] = useState<MessageItem[]>([]);

  const items = infoMessages.concat(isLoggedOut ? nonLoggedInMessages : [], messages);

  return (
    <SmallCard>
      <MessagesSide items={items} />
      <FormSide>
        <h2 className="text-xl font-bold mb-4 text-center">Add a feed</h2>
        <AddDigestFeedForm email={email} setMessages={setMessages} />
      </FormSide>
    </SmallCard>
  );
}
