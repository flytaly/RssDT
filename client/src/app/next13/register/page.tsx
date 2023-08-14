'use client';

import { useState } from 'react';

import MainCard from '@/app/main-card';
import { MessageItem } from '@/components/main-card/animated-message';
import FormSide from '@/components/main-card/form-side';
import MessagesSide from '@/components/main-card/messages-side';

import RegisterForm from './register-form';

const initialMessages: MessageItem[] = [
  {
    text: 'Enter email and password to create account',
    key: 'register-message',
  },
];

function Register() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  return (
    <MainCard>
      <MessagesSide items={[...initialMessages, ...messages]} />
      <FormSide>
        <h2 className="text-xl font-bold mb-4 text-center">Register</h2>
        <RegisterForm setMessages={setMessages} />
      </FormSide>
    </MainCard>
  );
}

export default Register;
