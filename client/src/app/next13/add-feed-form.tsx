'use client';

import { useState } from 'react';
import { ZodFormattedError } from 'zod';

import ClockIcon from '@/../public/static/clock.svg';
import MailIcon from '@/../public/static/envelope.svg';
import RssSquareIcon from '@/../public/static/rss-square.svg';
import { addFeedAction } from '@/app/_actions';
import { DigestSchedule, periodNames as names } from '@/types';

import InputWithIcon from './icon-input';
import SelectWithIcon from './icon-select';

type ValidationError = ZodFormattedError<{ url: string; email: string }, string> | null;

export function AddFeedForm() {
  const [validationError, setValidationError] = useState<ValidationError>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function processForm(data: FormData) {
    const results = await addFeedAction(data);
    setValidationError(results.error);
    setIsSubmitting(false);
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
        placeholder="Email"
        title="Email address"
        error={validationError?.email?._errors[0]}
      />
      <SelectWithIcon
        id="digest"
        IconSVG={ClockIcon}
        defaultValue={DigestSchedule.daily}
        /* error={errors.digest} */
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
