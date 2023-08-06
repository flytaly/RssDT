import { NextPage } from 'next';
import Link from 'next/link';
import React, { useState } from 'react';
import LoginForm from '../components/forms/log-in-form';
import Layout from '../components/layout/layout';
import { MessageItem } from '../components/main-card/animated-message';
import FormSide from '../components/main-card/form-side';
import MessagesSide from '../components/main-card/messages-side';
import MainCard from '../components/main-card/main-card';

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

const Login: NextPage = () => {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  return (
    <Layout>
      <MainCard>
        <MessagesSide items={[...initialMessages, ...messages]} />
        <FormSide>
          <h2 className="text-xl font-bold mb-4 text-center">Log in</h2>
          <LoginForm setMessages={setMessages} />
        </FormSide>
      </MainCard>
    </Layout>
  );
};

export default Login;
