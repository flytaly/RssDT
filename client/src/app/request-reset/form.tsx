import Link from 'next/link';
import { useState } from 'react';

import MailIcon from '@/../public/static/envelope.svg';
import { requestResetAction, RequestResetValidationError } from '@/app/actions/request-reset';
import InputWithIcon from '@/app/components/forms/icon-input';
import { MessageItem } from '@/components/main-card/animated-message';
import { useSubmitHandler } from '@/hooks/use-submit-handler';

interface Props {
  setMessages?: React.Dispatch<React.SetStateAction<MessageItem[]>>;
}

export default function RequestPasswordChangeForm({ setMessages }: Props) {
  const [validationError, setValidationError] = useState<RequestResetValidationError>(null);

  async function processForm(data: FormData) {
    const result = await requestResetAction(data);
    if (!result) return;

    setValidationError(result.error);
    if (!result.response || !setMessages) return;

    const { message } = result.response;

    if (message === 'OK') {
      setMessages?.([{ type: 'success', key: 'success', text: 'Reset link has been sent' }]);
      return;
    }
    setMessages?.([{ type: 'error', key: 'error', text: message }]);
  }

  const { submitHandler, isSubmitting } = useSubmitHandler(processForm, setMessages);

  return (
    <form className="flex flex-col w-full" action={requestResetAction} onSubmit={submitHandler}>
      <InputWithIcon
        id="email"
        type="email"
        name="email"
        IconSVG={MailIcon}
        placeholder="Email"
        title="Email address"
        error={validationError?.email?._errors[0]}
        required
      />
      <div className="w-full text-right mb-3">
        <Link href="/login" className="text-xs underline">
          ← back to log in form
        </Link>
      </div>
      <button
        type="submit"
        className="submit-btn w-full text-xl tracking-wider"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Loading...' : 'Email me'}
      </button>
    </form>
  );
}
