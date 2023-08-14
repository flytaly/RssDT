import { useState } from 'react';

import { MessageItem } from '@/components/main-card/animated-message';

export function useSubmitHandler(
  processForm: (data: FormData) => Promise<void>,
  setMessages?: React.Dispatch<React.SetStateAction<MessageItem[]>>,
) {
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return { isSubmitting, submitHandler };
}
