'use client';

import { useQuery } from '@tanstack/react-query';

import { getGQLClient } from '@/app/getQueryClient';
import MainCard from '@/app/main-card';
import { MessageItem } from '@/components/main-card/animated-message';
import FormSide from '@/components/main-card/form-side';
import MessageBlock from '@/components/message-block';

import { AddFeedForm } from './add-feed-form';

export default function Page() {
  const items: MessageItem[] = [];
  const { data } = useQuery(['me'], async () => getGQLClient().me(), {
    retry: false,
  });
  let email = data?.me?.email;
  return (
    <MainCard>
      <section className="relative flex-grow flex flex-col items-center rounded-md p-3 md:w-1/2">
        <MessageBlock items={items} />
      </section>
      <FormSide>
        <h2 className="text-xl font-bold mb-4 text-center">Add a feed</h2>
        <AddFeedForm email={email} />
      </FormSide>
    </MainCard>
  );
}
