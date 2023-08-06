/* import SpinnerIcon from '../../public/static/spinner.svg'; */

const Spinner: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <span className={className} title="loading"></span>;
};

export default Spinner;
