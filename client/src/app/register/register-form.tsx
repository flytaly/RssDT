import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { RegisterValidationError, registerAction } from '@/app/(actions)/register';
import MailIcon from '@/assets/envelope.svg';
import PasswordIcon from '@/assets/key.svg';
import { MessageItem } from '@/components/card/animated-message';
import InputWithIcon from '@/components/forms/icon-input';
import { useSubmitHandler } from '@/hooks/use-submit-handler';

interface Props {
  setMessages?: React.Dispatch<React.SetStateAction<MessageItem[]>>;
}

export default function RegisterForm({ setMessages }: Props) {
  const [validationError, setValidationError] = useState<RegisterValidationError>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  async function processForm(data: FormData) {
    const result = await registerAction(data);
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
    <form className="flex flex-col w-full" action={registerAction} onSubmit={submitHandler}>
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
      <InputWithIcon
        id="confirm-password"
        type="Password"
        name="confirm"
        IconSVG={PasswordIcon}
        placeholder="Confirm password"
        title="Confirm password"
        error={validationError?.confirm?._errors[0]}
        min={8}
        required
      />
      <button
        type="submit"
        className="submit-btn w-full text-xl tracking-wider"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Registration...' : 'Register'}
      </button>
    </form>
  );
}
