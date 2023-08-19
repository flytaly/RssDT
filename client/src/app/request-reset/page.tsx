'use client';

import { useState } from 'react';

import SmallCard from '@/app/components/card/small-card';
import { MessageItem } from '@/components/main-card/animated-message';
import FormSide from '@/components/main-card/form-side';
import MessagesSide from '@/components/main-card/messages-side';

import RequestPasswordChangeForm from './form';

const initialMessages: MessageItem[] = [
  {
    key: 'request-pass-info',
    text: 'To reset password enter your email',
    static: true,
  },
];

export default function RequestReset() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  return (
    <SmallCard>
      <MessagesSide items={[...initialMessages, ...messages]} />
      <FormSide>
        <h2 className="text-xl font-bold mb-4 text-center">Reset password</h2>
        <RequestPasswordChangeForm setMessages={setMessages} />
      </FormSide>
    </SmallCard>
  );
}
