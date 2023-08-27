'use client';

import { useState } from 'react';

import { MessageItem } from '@/components/card/animated-message';
import FormSide from '@/components/card/form-side';
import MessagesSide from '@/components/card/messages-side';
import SmallCard from '@/components/card/small-card';

import RegisterForm from './register-form';

const initialMessages: MessageItem[] = [
  {
    text: 'Enter email and password to create account',
    key: 'register-message',
    static: true,
  },
];

function Register() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  return (
    <SmallCard>
      <MessagesSide items={[...initialMessages, ...messages]} />
      <FormSide>
        <h2 className="text-xl font-bold mb-4 text-center">Register</h2>
        <RegisterForm setMessages={setMessages} />
      </FormSide>
    </SmallCard>
  );
}

export default Register;
