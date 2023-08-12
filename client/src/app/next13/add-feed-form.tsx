'use client';

import { useState } from 'react';

import ClockIcon from '@/../public/static/clock.svg';
import MailIcon from '@/../public/static/envelope.svg';
import RssSquareIcon from '@/../public/static/rss-square.svg';
import { ValidationError, addFeedAnonAction, addFeedLoggedInAction } from '@/app/_actions';
import { DigestSchedule, periodNames as names } from '@/types';

import InputWithIcon from './icon-input';
import SelectWithIcon from './icon-select';

export function AddFeedForm({ email }: { email?: string }) {
  const [validationError, setValidationError] = useState<ValidationError>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function processForm(data: FormData) {
    const isLoggedIn = !!email;
    let action = isLoggedIn ? addFeedLoggedInAction : addFeedAnonAction;
    const result = await action(data);
    if (!result) return;

    setValidationError(result.error);
    setIsSubmitting(false);
    if (result.response) {
      console.log(result.response);
    }
  }

  return (
    <form
      className="flex flex-col w-full"
      action={processForm}
      onSubmit={() => setIsSubmitting(true)}
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
