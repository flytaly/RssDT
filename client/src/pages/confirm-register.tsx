import { GetServerSidePropsContext, NextPage } from 'next';
import { useRouter } from 'next/dist/client/router';
import React, { useEffect } from 'react';
import Layout from '../components/layout/layout';
import { MessageItem } from '../components/main-card/animated-message';
import MainCard from '../components/main-card/main-card';
import MessagesSide from '../components/main-card/messages-side';
import {
  MeDocument,
  MeQuery,
  useVerifyEmailMutation,
  VerifyEmailMutation,
} from '../generated/graphql';

type ConfirmRegisterProps = { id?: string; token?: string };

const wrongQueryMsg: MessageItem = {
  key: 'query-error',
  text: 'No token or id provided in the URL',
  type: 'error',
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

const ConfirmRegister: NextPage<ConfirmRegisterProps> = ({ id, token }) => {
  const [verifyEmail, { loading, data, error }] = useVerifyEmailMutation();
  const messages: MessageItem[] = [];
  const router = useRouter();
  if (!id || !token) messages.push(wrongQueryMsg);
  if (data?.verifyEmail) messages.push(...getMessages(data));
  if (error) messages.push({ type: 'error', text: error.message, key: 'graphqlError' });

  useEffect(() => {
    if (token && id) {
      verifyEmail({
        variables: { token, userId: id },
        update: (cache, result) => {
          cache.writeQuery<MeQuery>({
            query: MeDocument,
            data: { __typename: 'Query', me: result.data?.verifyEmail.user },
          });
        },
      });
    }
  }, [id, token]);

  useEffect(() => {
    let tmId: number;
    if (data?.verifyEmail.user) {
      tmId = window.setTimeout(() => {
        router.push('/feeds/manage');
      }, 1500);
    }
    return () => clearTimeout(tmId);
  }, [data?.verifyEmail.user]);

  return (
    <Layout>
      <MainCard>
        <div className="flex flex-col items-center w-full text-center p-4">
          <h2 className="text-xl font-bold mb-4 text-center">Confirm email</h2>
          {loading ? <b>Confirming</b> : null}
          <MessagesSide items={messages} />
        </div>
      </MainCard>
    </Layout>
  );
};

export const getServerSideProps = (context: GetServerSidePropsContext) => {
  const { id, token } = context.query as { id?: string; token?: string };
  return { props: { id: id || null, token: token || null } } as { props: ConfirmRegisterProps };
};

export default ConfirmRegister;
