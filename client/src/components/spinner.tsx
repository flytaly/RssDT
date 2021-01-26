import SpinnerIcon from '../../public/static/spinner.svg';

function Spinner() {
  return (
    <div className="animate-spin" title="loading animation">
      <SpinnerIcon className="w-auto h-4" />
    </div>
  );
}

export default Spinner;
