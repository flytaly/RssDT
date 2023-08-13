'use client';

import { useRef, useState } from 'react';

import ClockIcon from '@/../public/static/clock.svg';
import MailIcon from '@/../public/static/envelope.svg';
import RssSquareIcon from '@/../public/static/rss-square.svg';
import { ValidationError, addFeedAnonAction, addFeedLoggedInAction } from '@/app/_actions';
import { MessageItem } from '@/components/main-card/animated-message';
import { ArgumentError } from '@/gql/generated';
import { DigestSchedule, periodNames as names } from '@/types';

import InputWithIcon from './icon-input';
import SelectWithIcon from './icon-select';

function getErrorMessages(errors: ArgumentError[]) {
  const errMessages: MessageItem[] = errors.map((e, idx) => ({
    key: `error_${idx + Math.random()}`,
    text: e.message,
    type: 'error',
  }));
  return errMessages;
}

function makeSuccessMessage(title: string, schedule: DigestSchedule, email?: string | null) {
  const content = (
    <span>
      <div>
        <b>{title}</b>
        <span> [</span>
        <b>{`${names[schedule as unknown as DigestSchedule]} digest`}</b>
        <span>] </span>
      </div>
      {email && <div>{`Activation link has been sent to ${email}.`}</div>}
    </span>
  );
  return { key: `success${Math.random() * 1000}`, content, type: 'success' } as MessageItem;
}

interface AddDigestFeedFormProps {
  email?: string;
  setMessages?: React.Dispatch<React.SetStateAction<MessageItem[]>>;
}

export function AddDigestFeedForm({ email, setMessages }: AddDigestFeedFormProps) {
  const [validationError, setValidationError] = useState<ValidationError>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function processForm(data: FormData) {
    const isLoggedIn = !!email;
    let action = isLoggedIn ? addFeedLoggedInAction : addFeedAnonAction;
    const result = await action(data);
    if (!result) return;

    setValidationError(result.error);
    if (!result.response || !setMessages) return;

    const { errors, userFeed } = result.response;
    if (errors) {
      return setMessages(getErrorMessages(errors));
    }
    if (!userFeed) return;

    setMessages([
      makeSuccessMessage(
        userFeed.feed?.title || '',
        userFeed.schedule as unknown as DigestSchedule,
        isLoggedIn ? null : data.get('email')?.toString() || '',
      ),
    ]);
    formRef.current?.reset();
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
    <form
      className="flex flex-col w-full"
      action={!!email ? addFeedLoggedInAction : addFeedAnonAction}
      onSubmit={submitHandler}
      ref={formRef}
    >
      <InputWithIcon
        id="feed-url"
        name="url"
        IconSVG={RssSquareIcon}
        placeholder="https://..."
        title="The RSS or Atom feed url"
        error={validationError?.url?._errors[0]}
      />
      <InputWithIcon
        id="email"
        name="email"
        IconSVG={MailIcon}
        value={email}
        readOnly={!!email}
        placeholder="Email"
        title="Email address"
        error={validationError?.email?._errors[0]}
      />
      <SelectWithIcon
        id="digest"
        name="digest"
        IconSVG={ClockIcon}
        defaultValue={DigestSchedule.daily}
        error={validationError?.digest?._errors[0]}
        disabled={isSubmitting}
      >
        {Object.values(DigestSchedule).map((sc) => (
          <option key={sc} value={sc}>{`${names[sc]} digest`}</option>
        ))}
      </SelectWithIcon>

      <button
        type="submit"
        className="submit-btn w-full text-xl tracking-wider"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'loading...' : 'subscribe'}
      </button>
    </form>
  );
}
