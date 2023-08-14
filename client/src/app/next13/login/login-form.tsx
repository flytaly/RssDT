'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import MailIcon from '@/../public/static/envelope.svg';
import PasswordIcon from '@/../public/static/key.svg';
import { loginAction, LoginValidationError } from '@/app/actions/login';
import InputWithIcon from '@/app/components/forms/icon-input';
import { MessageItem } from '@/components/main-card/animated-message';

interface LoginProps {
  setMessages?: React.Dispatch<React.SetStateAction<MessageItem[]>>;
}

export default function LoginForm({ setMessages }: LoginProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<LoginValidationError>(null);
  const router = useRouter();

  async function processForm(data: FormData) {
    const result = await loginAction(data);
    if (!result) return;

    setValidationError(result.error);
    if (!result.response || !setMessages) return;

    const { user, errors } = result.response;

    if (!user) {
      setMessages?.([{ type: 'error', key: 'error', text: errors?.[0].message }]);
      return;
    }
    router.push('/manage');
  }

  async function submitHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await processForm(new FormData(e.target as HTMLFormElement));
    } catch (err) {
      setMessages?.([{ key: 'erorr', text: (err as Error)?.message, type: 'error' }]);
    }
    setIsSubmitting(false);
  }

  return (
    <form className="flex flex-col w-full" action={loginAction} onSubmit={submitHandler}>
      <InputWithIcon
        id="email"
        name="email"
        IconSVG={MailIcon}
        placeholder="Email"
        title="Email address"
        required
        error={validationError?.email?._errors[0]}
      />
      <InputWithIcon
        id="password"
        type="Password"
        name="password"
        IconSVG={PasswordIcon}
        placeholder="Password"
        title="Password"
        error={validationError?.password?._errors[0]}
        min={8}
        required
      />
      <button
        type="submit"
        className="submit-btn w-full text-xl tracking-wider"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Logging in...' : 'Log in'}
      </button>
    </form>
  );
}
