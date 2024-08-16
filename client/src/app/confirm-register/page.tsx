'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { type MessageItem } from '@/components/card/animated-message';
import MessagesSide from '@/components/card/messages-side';
import SmallCard from '@/components/card/small-card';
import { VerifyEmailMutation } from '@/gql/generated';
import { getGQLClient } from '@/lib/gqlClient.client';

const notEnoughInfoMsg: MessageItem = {
  key: 'query-error',
  text: 'No token or id provided in the URL',
  type: 'error',
  static: true,
};

const getMessages = (data: VerifyEmailMutation): MessageItem[] => {
  const { user, errors } = data.verifyEmail;
  if (user)
    return [
      {
        key: 'activation-success',
        text: `Email has been confirmed.`,
        type: 'success',
      },
      {
        key: 'redirecting',
        text: 'Redirecting...',
        type: 'default',
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

export default function ConfirmRegister({
  searchParams: { id, token },
}: {
  searchParams: { id?: string; token?: string };
}) {
  const { mutate, isPending, isError, error, data } = useMutation({
    mutationFn: async () => getGQLClient().verifyEmail({ token: token!, userId: id! }),
  });

  const router = useRouter();

  useEffect(() => {
    if (token && id) {
      mutate();
    }
  }, [token, id, mutate]);

  useEffect(() => {
    let tmId: number;
    if (data?.verifyEmail.user) {
      tmId = window.setTimeout(() => {
        router.push('/manage');
      }, 1500);
    }
    return () => clearTimeout(tmId);
  }, [data?.verifyEmail.user, router]);

  const messages: MessageItem[] = [];
  if (!id || !token) messages.push(notEnoughInfoMsg);

  if (data?.verifyEmail) {
    messages.push(...getMessages(data));
  }
  if (isError) {
    messages.push({ type: 'error', text: (error as Error).message, key: 'graphqlError' });
  }

  return (
    <SmallCard>
      <div className="flex flex-col items-center w-full text-center p-4">
        <h2 className="text-xl font-bold mb-4 text-center">Confirm email</h2>
        {isPending ? <b>Confirming</b> : null}
        <MessagesSide items={messages} />
      </div>
    </SmallCard>
  );
}
