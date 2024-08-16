'use client';

import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';

import { MessageItem } from '@/components/card/animated-message';
import MessagesSide from '@/components/card/messages-side';
import SmallCard from '@/components/card/small-card';
import { ActivateFeedMutation } from '@/gql/generated';
import { getGQLClient } from '@/lib/gqlClient.client';

const notEnoughInfoMsg: MessageItem = {
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

export default function Confirm({
  searchParams: { id, token },
}: {
  searchParams: { id?: string; token?: string };
}) {
  const { mutateAsync, isPending, isError, error, data } = useMutation({
    mutationFn: async () => getGQLClient().activateFeed({ token: token!, userFeedId: id! }),
  });

  const messages: MessageItem[] = [];
  if (!id || !token) messages.push(notEnoughInfoMsg);
  if (isError) {
    messages.push({ type: 'error', text: (error as Error).message, key: 'graphqlError' });
  }
  if (data?.activateFeed) messages.push(...getMessages(data));

  useEffect(() => {
    if (token && id) {
      console.log('mutation');
      mutateAsync();
    }
  }, [token, id, mutateAsync]);

  return (
    <SmallCard>
      <div className="flex flex-col items-center w-full text-center p-4">
        <h2 className="text-xl font-bold mb-4 text-center">Confirm feed</h2>
        {isPending ? <b>Confirming</b> : null}
        <MessagesSide items={messages} />
      </div>
    </SmallCard>
  );
}
