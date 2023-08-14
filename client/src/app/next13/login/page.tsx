'use client';

import Link from 'next/link';
import { useState } from 'react';

import MainCard from '@/app/main-card';
import { MessageItem } from '@/components/main-card/animated-message';
import FormSide from '@/components/main-card/form-side';
import MessagesSide from '@/components/main-card/messages-side';

import LoginForm from './login-form';

const initialMessages: MessageItem[] = [
  {
    text: 'Log in to manage your feeds or change settings',
    key: 'login-message',
  },
  {
    content: (
      <>
        <span>To reset or create new password&nbsp;</span>
        <Link href="request-reset" className="text-primary underline">
          click here
        </Link>
      </>
    ),
    key: 'digest-message',
  },
];

export default function Login() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  return (
    <MainCard>
      <MessagesSide items={[...initialMessages, ...messages]} />
      <FormSide>
        <h2 className="text-xl font-bold mb-4 text-center">Log in</h2>
        <LoginForm setMessages={setMessages} />
      </FormSide>
    </MainCard>
  );
}
