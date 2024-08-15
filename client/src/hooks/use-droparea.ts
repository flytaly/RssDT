/* eslint-disable consistent-return */
import { useRef, useState, useEffect } from 'react';

export function useDropArea({
  onFilesDrop,
  disable = false,
}: {
  onFilesDrop: (fl?: FileList) => unknown;
  disable?: boolean;
}) {
  const dropAreaRef = useRef<HTMLElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  useEffect(() => {
    const elem = dropAreaRef.current;
    if (disable || !elem) return;
    const handleDrag = (ev: DragEvent) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (ev.type === 'dragenter' || ev.type === 'dragover') setIsHovered(true);
      if (ev.type === 'dragleave' || ev.type === 'drop') setIsHovered(false);
      if (ev.type === 'drop') onFilesDrop(ev.dataTransfer?.files);
    };
    elem?.addEventListener('dragenter', handleDrag, false);
    elem?.addEventListener('dragleave', handleDrag, false);
    elem?.addEventListener('dragover', handleDrag, false);
    elem?.addEventListener('drop', handleDrag, false);
    return () => {
      elem?.removeEventListener('dragenter', handleDrag, false);
      elem?.removeEventListener('dragleave', handleDrag, false);
      elem?.removeEventListener('dragover', handleDrag, false);
      elem?.removeEventListener('drop', handleDrag, false);
    };
  }, [disable, onFilesDrop]);

  return { isHovered, dropAreaRef };
}
