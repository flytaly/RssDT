import EmailVerificationWarning from '@/email-verification-warning';

interface CardProps {
  big?: boolean;
  children: React.ReactNode;
  verificationWarning?: boolean;
  span?: boolean;
}

export default function BigCard({
  children,
  span = false,
  verificationWarning = false,
}: CardProps) {
  const width = span ? 'w-screen' : '';
  return (
    <article
      id="card-root"
      className={`relative flex flex-col md:flex-row big-card-w ${width} flex-1 min-h-100 bg-gray-100 rounded-md shadow-modal mx-auto `}
    >
      {verificationWarning ? <EmailVerificationWarning /> : null}
      {children}
    </article>
  );
}
