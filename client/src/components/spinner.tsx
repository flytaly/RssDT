/* import SpinnerIcon from '../../public/static/spinner.svg'; */

const Spinner = ({ className = '' }: { className?: string }) => {
  return <span className={className} title="loading"></span>;
};

export default Spinner;
