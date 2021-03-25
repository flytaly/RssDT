import React from 'react';
import { useDropArea } from '../hooks/use-droparea';
import { getFeedsFromOpml, getFeedsFromText } from '../utils/import-utils';

export const ImportForm = () => {
  const onFileDrop = async (fl?: FileList) => {
    if (!fl) return;
    const file = fl[0];
    if (file.name.endsWith('.opml') || file.type === 'text/xml') {
      const content = await file.text();
      const feeds = await getFeedsFromOpml(content);
      console.log(feeds);
    }
    if (file.type === 'text/plain') {
      const content = await file.text();
      const feeds = getFeedsFromText(content);
      console.log(feeds);
    }
  };
  const { dropAreaRef, isHovered } = useDropArea(onFileDrop);
  return (
    <div className="px-3 py-5 w-full">
      <form id="drop-area" ref={dropAreaRef as React.RefObject<HTMLFormElement>}>
        <label
          htmlFor="fileElem"
          className={`flex justify-center items-center w-full h-36 p-1 border-2 border-dashed cursor-pointer ${
            isHovered ? 'bg-primary-2 border-primary' : 'bg-primary-1 border-secondary'
          }`}
        >
          <p>Drop file here or click to upload</p>
        </label>
        <input
          className="hidden"
          type="file"
          id="fileElem"
          accept="text/plain,text/opml,text/xml"
          onChange={() => {}}
        />
      </form>
    </div>
  );
};
