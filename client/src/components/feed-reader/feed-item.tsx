import React, { RefObject, useCallback, useState } from 'react';
import PaperClipIcon from '../../../public/static/paperclip.svg';
import ShareIcon from '../../../public/static/share-2.svg';
import { Item, ItemFieldsFragment } from '../../generated/graphql';
import shareProviders from '../../share-providers';
import { clamp } from '../../utils/clamp';
import usePopup from '../../utils/use-popup';
import { ReaderOptions } from './reader-options';

interface FeedItemProps {
  item: ItemFieldsFragment;
  readerOpts: ReaderOptions;
}

function getItemHTML(item: Pick<Item, 'description' | 'summary'>) {
  return { __html: item.summary || item.description || '' };
}

interface FooterBtnProps {
  Icon: React.FC<React.SVGAttributes<SVGElement>>;
  text: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const FooterBtnList: React.FC<FooterBtnProps> = ({ Icon, text, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { anchorRef } = usePopup(
    isOpen,
    useCallback(() => setIsOpen(false), [setIsOpen]),
  );

  return (
    <div ref={anchorRef as RefObject<HTMLDivElement>} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((s) => !s)}
        className="flex items-center font-semibold rounded p-1 hover:bg-gray-200"
      >
        <Icon
          className="flex items-center font-semibold rounded
        p-1 hover:bg-gray-200
        "
        />
        <span>{text}</span>
      </button>
      {isOpen && children ? (
        <div className="absolute bg-white top-full right-0 shadow-popup text-xs z-10 min-w-min rounded-sm">
          {children}
        </div>
      ) : null}
    </div>
  );
};

const fontSizes = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl'];

const FeedItem: React.FC<FeedItemProps> = ({ item, readerOpts }) => {
  return (
    <article
      key={item.id}
      className={`relative px-3 pt-2 pb-1 shadow-message bg-white rounded-sm ${
        fontSizes[readerOpts.fontSize]
      }`}
    >
      <h4 className="font-bold">{item.title}</h4>
      <div className="text-sm mb-3">
        {new Date(item.pubdate || item.createdAt).toLocaleString()}
      </div>
      {/* eslint-disable-next-line react/no-danger */}
      <main dangerouslySetInnerHTML={getItemHTML(item)} />
      <footer className="flex justify-end mt-1 space-x-1">
        <FooterBtnList Icon={PaperClipIcon} text={`enclosures: ${item.enclosures?.length}`}>
          {item.enclosures?.map((enc) => (
            <div key={enc.url}>
              <a
                className="flex hover:underline hover:bg-gray-200 whitespace-nowrap p-1"
                href={enc.url}
                title={enc.url}
                target="_blank"
                rel="noreferrer"
              >
                <div style={{ maxWidth: '10rem' }} className="overflow-hidden overflow-ellipsis">
                  {enc.url}
                </div>
                {enc.type ? <span>{` (${enc.type})`}</span> : null}
              </a>
            </div>
          ))}
        </FooterBtnList>
        {item.link ? (
          <FooterBtnList Icon={ShareIcon} text="share">
            {shareProviders.map(({ id, getUrl, iconUrl, title }) => (
              <div key={id}>
                <a
                  className="flex hover:bg-gray-200 whitespace-nowrap py-1 px-2"
                  href={getUrl(item.link!, item.title || item.guid || '')}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="w-4 mr-1">
                    <img src={iconUrl} alt={title} className="w-4 h-4" />
                  </span>
                  <span>{title}</span>
                </a>
              </div>
            ))}
          </FooterBtnList>
        ) : null}
      </footer>
    </article>
  );
};

export default FeedItem;
