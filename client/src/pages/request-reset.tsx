import { NextPage } from 'next';
import React, { useState } from 'react';
import RequestPasswordChangeForm from '../components/forms/request-password-change';
import Layout from '../components/layout/layout';
import { MessageItem } from '../components/main-card/animated-message';
import FormSide from '../components/main-card/form-side';
import MessagesSide from '../components/main-card/messages-side';
import MainCard from '../components/main-card/main-card';

const initialMessages: MessageItem[] = [
  {
    key: 'request-pass-info',
    text: 'To reset password enter your email',
  },
];

const RequestReset: NextPage = () => {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  return (
    <Layout>
      <MainCard>
        <MessagesSide items={[...initialMessages, ...messages]} />
        <FormSide>
          <h2 className="text-xl font-bold mb-4 text-center">Reset password</h2>
          <RequestPasswordChangeForm setMessages={setMessages} />
        </FormSide>
      </MainCard>
    </Layout>
  );
};

export default RequestReset;
