'use client';

import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { loginAction, LoginValidationError } from '@/app/actions/login';
import MailIcon from '@/assets/envelope.svg';
import PasswordIcon from '@/assets/key.svg';
import { MessageItem } from '@/components/card/animated-message';
import InputWithIcon from '@/components/forms/icon-input';
import { useSubmitHandler } from '@/hooks/use-submit-handler';

interface LoginProps {
  setMessages?: React.Dispatch<React.SetStateAction<MessageItem[]>>;
}

export default function LoginForm({ setMessages }: LoginProps) {
  const [validationError, setValidationError] = useState<LoginValidationError>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

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
    queryClient.invalidateQueries({ queryKey: ['me'] });
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
      <div className="w-full text-right mb-3">
        <Link href="/request-reset" className="text-xs underline">
          I forgot or don&apos;t have password
        </Link>
      </div>
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
