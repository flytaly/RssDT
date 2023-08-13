import React from 'react';

/* import EmailVerificationWarning from '@/email-verification-warning'; */

interface MainCardProps {
  big?: boolean;
  children: React.ReactNode;
  onlyWithVerifiedEmail?: boolean;
}

const MainCard = ({ children, big = false }: MainCardProps) => {
  const baseWidth = big ? 'big-card-w' : 'small-card-w';
  const width = false ? 'w-screen' : '';
  const grow = big ? 'flex-1' : '';
  /* const showWarning = !isServer() && !loading && onlyWithVerifiedEmail && !data?.me?.emailVerified; */
  /* const showWarning = false; */

  return (
    <article
      id="card-root"
      className={`relative flex flex-col md:flex-row ${baseWidth} ${width} ${grow} min-h-100 bg-gray-100 rounded-md shadow-modal mx-auto `}
    >
      {/* {showWarning ? <EmailVerificationWarning /> : null} */}
      {children}
    </article>
  );
};

export default MainCard;
