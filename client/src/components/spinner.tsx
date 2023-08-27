import SpinnerIcon from '@/assets/spinner.svg';

const Spinner = ({ className = '' }: { className?: string }) => {
  return (
    <span className={className} title="loading">
      <SpinnerIcon className="animate-spin w-4 h-4" />
    </span>
  );
};

export default Spinner;
