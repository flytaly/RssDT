import React, { useState } from 'react';
import { useRequestEmailVerificationMutation } from './generated/graphql';

const EmailVerificationWarning = () => {
  const [resendEmail, { loading, error }] = useRequestEmailVerificationMutation();

  const [status, setStatus] = useState<'success' | 'error' | null>(null);

  let buttonText = 'Send activation link again';
  if (loading) buttonText = 'Sending activation link...';
  if (status === 'success') buttonText = 'Activation link has been sent';

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
            resendEmail()
              .then(() => setStatus('success'))
              .catch((err) => {
                setStatus('error');
                console.error(err);
              });
          }}
          className={`mt-4 ${status === 'success' ? 'cursor-default' : 'underline'}`}
          disabled={status === 'success' || loading}
        >
          {buttonText}
        </button>
        {status === 'error' && error?.message ? (
          <div className="text-error p-2 mt-2">{error?.message}</div>
        ) : null}
      </div>
    </div>
  );
};

export default EmailVerificationWarning;
