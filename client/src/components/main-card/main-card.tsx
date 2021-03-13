import React, { useContext } from 'react';
import { AppStateCtx } from '../app-context';
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
  const { fullWidth } = useContext(AppStateCtx);
  const { data, loading } = useMeQuery({ ssr: false });

  const baseWidth = big ? 'big-card-w' : 'small-card-w';
  const width = big && fullWidth ? 'w-screen' : '';
  const grow = big ? 'flex-1' : '';
  const showWarning = !isServer() && !loading && onlyWithVerifiedEmail && !data?.me?.emailVerified;

  return (
    <article
      id="card-root"
      className={`relative flex flex-col md:flex-row ${baseWidth} ${width} ${grow} min-h-100 bg-gray-100 rounded-md shadow-modal mx-auto `}
    >
      {showWarning ? <EmailVerificationWarning /> : null}
      {children}
    </article>
  );
};

export default MainCard;
