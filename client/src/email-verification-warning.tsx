'use client';

import { useMutation } from '@tanstack/react-query';

import { getGQLClient } from './app/lib/gqlClient.client';

const EmailVerificationWarning = () => {
  const { mutateAsync, isLoading, error, isError, isSuccess, data } = useMutation({
    mutationFn: async () => {
      return getGQLClient().requestEmailVerification();
    },
  });

  let buttonText = 'Send activation link again';
  if (isLoading) buttonText = 'Sending activation link...';
  if (isSuccess && data.requestEmailVerification) buttonText = 'Activation link has been sent';

  return (
    <div className="absolute flex justify-center items-start w-full h-full bg-white bg-opacity-50 z-20 ">
      <div className="bg-white mt-4 p-3 text-center border border-error shadow-message-err hover:shadow-message-err-darker rounded">
        <div>
          <div className="text-error">Your email wasn&apos;t confirmed.</div>
          <div>Check mail for confirmation link.</div>
        </div>
        <button
          type="button"
          onClick={() => {
            mutateAsync();
          }}
          className={`mt-4 ${status === 'success' ? 'cursor-default' : 'underline'}`}
          disabled={status === 'success' || isLoading}
        >
          {buttonText}
        </button>
        {isError && (error as Error)?.message ? (
          <div className="text-error p-2 mt-2">{(error as Error)?.message}</div>
        ) : null}
      </div>
    </div>
  );
};

export default EmailVerificationWarning;
