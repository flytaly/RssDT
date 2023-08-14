'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import MailIcon from '@/../public/static/envelope.svg';
import PasswordIcon from '@/../public/static/key.svg';
import { loginAction, LoginValidationError } from '@/app/actions/login';
import InputWithIcon from '@/app/components/forms/icon-input';
import { useSubmitHandler } from '@/app/hooks/useSubmitHandler';
import { MessageItem } from '@/components/main-card/animated-message';

interface LoginProps {
  setMessages?: React.Dispatch<React.SetStateAction<MessageItem[]>>;
}

export default function LoginForm({ setMessages }: LoginProps) {
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

  const { isSubmitting, submitHandler } = useSubmitHandler(processForm, setMessages);

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
