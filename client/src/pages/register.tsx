import { NextPage } from 'next';
import React, { useState } from 'react';

import RegisterForm from '@/components/forms/register-form';
import Layout from '@/components/layout/layout';
import { MessageItem } from '@/components/main-card/animated-message';
import FormSide from '@/components/main-card/form-side';
import MainCard from '@/components/main-card/main-card';
import MessagesSide from '@/components/main-card/messages-side';

const initialMessages: MessageItem[] = [
  {
    text: 'Enter email and password to create account',
    key: 'register-message',
  },
];

const Register: NextPage = () => {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  return (
    <Layout>
      <MainCard>
        <MessagesSide items={[...initialMessages, ...messages]} />
        <FormSide>
          <h2 className="text-xl font-bold mb-4 text-center">Register</h2>
          <RegisterForm setMessages={setMessages} />
        </FormSide>
      </MainCard>
    </Layout>
  );
};

export default Register;
