'use client';

import React, { useState } from 'react';

import SmallCard from '@/app/components/card/small-card';
import { MessageItem } from '@/components/main-card/animated-message';
import FormSide from '@/components/main-card/form-side';
import MessagesSide from '@/components/main-card/messages-side';

import SetPasswordForm from './set-password-form';

const initialMessages: MessageItem[] = [
  {
    key: 'reset-pass-info',
    text: 'Enter new password',
  },
];

export default function ResetPassword({
  searchParams: { id, token },
}: {
  searchParams: { id?: string; token?: string };
}) {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const msgItems = [...initialMessages, ...messages];
  if (!id || !token)
    msgItems.push({
      key: 'query_error',
      type: 'error',
      text: 'No token or id provided in the URL',
    });

  return (
    <SmallCard>
      <MessagesSide items={msgItems} />
      <FormSide>
        <h2 className="text-xl font-bold mb-4 text-center">Reset password</h2>
        <SetPasswordForm token={token || ''} userId={id || ''} setMessages={setMessages} />
      </FormSide>
    </SmallCard>
  );
}
