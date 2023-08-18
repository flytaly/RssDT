interface SmallCardProps {
  children: React.ReactNode;
  onlyWithVerifiedEmail?: boolean;
}

export default function MainCard({ children }: SmallCardProps) {
  return (
    <article
      id="card-root"
      className={`relative flex flex-col md:flex-row small-card-w min-h-100 bg-gray-100 rounded-md shadow-modal mx-auto `}
    >
      {children}
    </article>
  );
}
