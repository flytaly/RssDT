import { GetServerSidePropsContext, NextPage } from 'next';
import React, { useState } from 'react';
import SetPasswordForm from '../components/forms/set-password-form';
import Layout from '../components/layout/layout';
import { MessageItem } from '../components/welcome-card/animated-message';
import FormSide from '../components/welcome-card/form-side';
import MessagesSide from '../components/welcome-card/messages-side';
import MainCard from '../components/welcome-card/main-card';

const initialMessages: MessageItem[] = [
  {
    key: 'reset-pass-info',
    text: 'Enter new password',
  },
];

type ResetPasswordProps = { id: string | null; token: string | null };

const ResetPassword: NextPage<ResetPasswordProps> = ({ id, token }) => {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const msgItems = [...initialMessages, ...messages];
  if (!id || !token)
    msgItems.push({
      key: 'query_error',
      type: 'error',
      text: 'No token or id provided in the URL',
    });

  return (
    <Layout>
      <MainCard>
        <MessagesSide items={msgItems} />
        <FormSide>
          <h2 className="text-xl font-bold mb-4 text-center">Reset password</h2>
          <SetPasswordForm token={token || ''} userId={id || ''} setMessages={setMessages} />
        </FormSide>
      </MainCard>
    </Layout>
  );
};

export const getServerSideProps = (context: GetServerSidePropsContext) => {
  const { id, token } = context.query as { id?: string; token?: string };
  return { props: { id: id || null, token: token || null } } as { props: ResetPasswordProps };
};

export default ResetPassword;
