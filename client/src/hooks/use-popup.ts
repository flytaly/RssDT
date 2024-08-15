import { useEffect, useRef } from 'react';

const usePopup = (isOpen: boolean, onClose: () => void) => {
  const anchorRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const elem = anchorRef.current;
    const onClick = (ev: MouseEvent) => {
      if (!elem?.contains(ev.target as Node)) onClose();
    };
    const onEscDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('click', onClick);
      document.addEventListener('keydown', onEscDown);
    }
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onEscDown);
    };
  }, [isOpen, onClose]);

  return { anchorRef };
};

export default usePopup;
