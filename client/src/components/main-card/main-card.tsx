import React from 'react';
import EmailVerificationWarning from '../../email-verification-warning';
import { useMeQuery } from '../../generated/graphql';
import { isServer } from '../../utils/is-server';

interface MainCardProps {
  big?: boolean;
  children: React.ReactNode;
  onlyWithVerifiedEmail?: boolean;
}

const MainCard: React.FC<MainCardProps> = ({
  children,
  big = false,
  onlyWithVerifiedEmail = false,
}) => {
  const { data, loading } = useMeQuery({ skip: isServer() });
  const size = big ? 'big-card-w' : 'small-card-w';
  const showWarning = !isServer && !loading && onlyWithVerifiedEmail && data?.me?.emailVerified;
  return (
    <article
      id="card-root"
      className={`relative flex flex-col md:flex-row ${size} min-h-100 bg-gray-100 rounded-md shadow-modal mx-auto`}
    >
      {showWarning ? <EmailVerificationWarning /> : null}
      {children}
    </article>
  );
};

export default MainCard;
