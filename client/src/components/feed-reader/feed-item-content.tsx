/* eslint-disable jsx-a11y/no-noninteractive-tabindex, jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable react/no-danger */
import React, { RefObject, useCallback, useState } from 'react';
import { Item, ItemFieldsFragment } from '../../generated/graphql';
import shareProviders from '../../share-providers';
import usePopup from '../../utils/use-popup';
import PaperClipIcon from '../../../public/static/paperclip.svg';
import ShareIcon from '../../../public/static/share-2.svg';

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
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((s) => !s);
        }}
        className="flex items-center font-semibold rounded p-1 hover:bg-gray-200"
      >
        <Icon className="flex items-center font-semibold rounded hover:bg-gray-200 h-4 w-4 mr-1" />
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

interface FeedItemContentProps {
  item: ItemFieldsFragment;
  containerClassName?: string;
  bodyClassName?: string;
  showBody?: boolean;
  bodyRef?: React.RefObject<HTMLElement> | null;
  bottomGradient?: boolean;
  bodyClickHandler?: (id: number) => void;
}

const FeedItemContent: React.FC<FeedItemContentProps> = ({
  item,
  containerClassName = '',
  bodyClassName = '',
  showBody = true,
  bodyRef = null,
  bottomGradient = false,
  bodyClickHandler,
}) => {
  const onKeyPress = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      bodyClickHandler?.(item.id);
    }
  };
  const onClick = () => bodyClickHandler?.(item.id);
  return (
    <article
      className={`relative px-3 pt-2 pb-1 shadow-message bg-white rounded-sm ${containerClassName} focus:shadow-message-darker`}
      role={bodyClickHandler ? 'button' : 'article'}
      tabIndex={bodyClickHandler ? 0 : -1}
      onKeyPress={bodyClickHandler && onKeyPress}
      onClick={bodyClickHandler && onClick}
    >
      <div className={`${bodyClickHandler ? 'cursor-pointer' : ''}`}>
        <h4 className="font-bold">{item.title}</h4>
        <div className="text-xs">{new Date(item.pubdate || item.createdAt).toLocaleString()}</div>
        {showBody && (
          <div className="relative mt-3">
            <main
              ref={bodyRef}
              className={`${bodyClassName}`}
              dangerouslySetInnerHTML={getItemHTML(item)}
            />
            {bottomGradient && (
              <div className="absolute w-full h-6 bottom-0 transparent-gradient" />
            )}
          </div>
        )}
      </div>
      <footer className="flex justify-end mt-1 space-x-1 text-xs">
        <FooterBtnList Icon={PaperClipIcon} text={`enclosures: ${item.enclosures?.length}`}>
          {item.enclosures?.map((enc) => (
            <div key={enc.url}>
              <a
                className="flex hover:underline hover:bg-gray-200 whitespace-nowrap p-1"
                href={enc.url}
                title={enc.url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
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
                  onClick={(e) => e.stopPropagation()}
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

export default FeedItemContent;
