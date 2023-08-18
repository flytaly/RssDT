'use client';

import MaximizeIcon from '@/../public/static/maximize.svg';

export default function ToggleMaximize() {
  const toggleWidth = () => {
    console.log('TODO: toggle width');
  };
  return (
    <button
      type="button"
      onClick={toggleWidth}
      title="Toggle width"
      className="icon-btn text-gray-700 hover:text-primary"
    >
      <MaximizeIcon className="w-5" />
    </button>
  );
}
