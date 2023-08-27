'use client';

import { useMutation } from '@tanstack/react-query';

import { MessageItem } from '@/components/card/animated-message';
import MessagesSide from '@/components/card/messages-side';
import { getGQLClient } from '@/lib/gqlClient.client';

export default function Unsubscribing({
  token,
  userFeedId: id,
}: {
  token: string;
  userFeedId: string;
}) {
  const { isSuccess, isError, mutate, isLoading, data, error } = useMutation({
    mutationFn: async () => getGQLClient().unsubscribeByToken({ token, id }),
  });

  const messages: MessageItem[] = [];
  if (isSuccess) {
    if (data?.unsubscribeByToken) {
      messages.push({ key: 'success', type: 'success', text: 'Successfully unsubscribed' });
    } else {
      const text = "Couldn't unsubscribe. Probably wrong token or id";
      messages.push({ type: 'error', key: 'error_no_success', text });
    }
  }
  if (isError) {
    messages.push({ type: 'error', text: (error as Error).message, key: 'graphqlError' });
  }
  return (
    <>
      <button
        type="submit"
        className="submit-btn mt-3"
        onClick={() => {
          mutate();
        }}
        disabled={isLoading || isSuccess}
      >
        {isLoading ? 'Unsubscribing' : ' Unsubscribe'}
      </button>
      <MessagesSide items={messages} />
    </>
  );
}
