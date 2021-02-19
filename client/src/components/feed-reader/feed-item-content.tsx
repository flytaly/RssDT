/* eslint-disable jsx-a11y/no-noninteractive-tabindex, jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable react/no-danger */
import React, { RefObject, useCallback, useState } from 'react';
import PaperClipIcon from '../../../public/static/paperclip.svg';
import ShareIcon from '../../../public/static/share-2.svg';
import { Item, ItemFieldsFragment } from '../../generated/graphql';
import shareProviders from '../../share-providers';
import usePopup from '../../utils/use-popup';

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
    <div ref={anchorRef as RefObject<HTMLDivElement>} className="relative" data-click-skip="true">
      <button
        type="button"
        onClick={() => setIsOpen((s) => !s)}
        className="flex items-center font-semibold rounded p-1 hover:bg-gray-200"
      >
        <Icon className="flex items-center font-semibold rounded hover:bg-gray-200 h-4 w-4 mr-1" />
        <span>{text}</span>
      </button>
      {isOpen && children ? (
        <div className="absolute bg-white right-0 shadow-popup text-xs z-10 min-w-min rounded-sm border border-gray-300 arrow-tr">
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
  isNew?: boolean;
}

const FeedItemContent: React.FC<FeedItemContentProps> = ({
  item,
  containerClassName = '',
  bodyClassName = '',
  showBody = true,
  bodyRef = null,
  bottomGradient = false,
  bodyClickHandler,
  isNew = false,
}) => {
  const onKeyPress = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      bodyClickHandler?.(item.id);
    }
  };
  const onClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    const target = e.target as HTMLElement;
    if (target.tagName !== 'A' && !target.closest('[data-click-skip]')) {
      bodyClickHandler?.(item.id);
    }
  };

  const isNewLabel = isNew && (
    <div
      className="absolute top-0 right-0 px-1 bg-gray-200
 text-xs text-gray-500 rounded-bl-md"
    >
      new
    </div>
  );

  const itemImg =
    item.imageUrl || item.enclosures?.find((enc) => enc.type?.startsWith('image'))?.url || null;
  return (
    <article
      className={`relative px-3 ${
        isNew ? 'pt-3' : 'pt-2'
      } pb-1 shadow-message bg-white rounded-sm ${containerClassName} focus:shadow-message-darker`}
      role={bodyClickHandler ? 'button' : 'article'}
      tabIndex={bodyClickHandler ? 0 : -1}
      onKeyPress={bodyClickHandler && onKeyPress}
      onClick={bodyClickHandler && onClick}
    >
      {isNewLabel}
      <div className={`${bodyClickHandler ? 'cursor-pointer' : ''}`}>
        {showBody && itemImg ? (
          <div className="float-right w-24 h-24">
            <img
              className="block ml-2 w-auto h-auto max-h-full max-w-full rounded-sm object-cover "
              src={itemImg}
              alt={item.title || 'item'}
            />
          </div>
        ) : null}
        <h4 className="font-bold relative">
          {item.link ? (
            <a
              href={item.link}
              className="hover:underline hover:text-link"
              target="_blank"
              rel="noreferrer"
            >
              {item.title}
            </a>
          ) : (
            item.title
          )}
        </h4>
        <div className="text-xs">{new Date(item.pubdate || item.createdAt).toLocaleString()}</div>
        {showBody && (
          <div className="relative mt-3">
            <main
              ref={bodyRef}
              className={`feed-item-body ${bodyClassName}`}
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
                className="flex hover:underline hover:bg-gray-200 whitespace-nowrap p-1 z-30"
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

export default FeedItemContent;
