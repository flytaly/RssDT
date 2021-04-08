/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import React, { RefObject, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  DigestSchedule,
  FeedFieldsFragment,
  UserFeedFieldsFragment,
} from '../../generated/graphql';
import Spinner from '../spinner';
import XIcon from '../../../public/static/x.svg';
import MoreIcon from '../../../public/static/more-horizontal.svg';
import usePopup from '../../hooks/use-popup';

interface FeedSidebarProps {
  feeds?: Array<{ feed: FeedFieldsFragment } & UserFeedFieldsFragment>;
  loading?: boolean;
  onAddFeedClick?: () => void;
  onSidebarClose?: () => void;
}

const FeedSidebar: React.FC<FeedSidebarProps> = ({
  feeds,
  loading,
  onAddFeedClick,
  onSidebarClose,
}) => {
  const router = useRouter();
  const [showOptions, setShowOptions] = useState(false);
  const [hideEmailFeeds, setHideEmailFeeds] = useState(false);
  const id = router.query.id ? parseInt(router.query.id as string) : null;
  const feedsSorted = useMemo(() => {
    const $feeds = hideEmailFeeds
      ? feeds?.filter((f) => !f.schedule || f.schedule === DigestSchedule.Disable)
      : feeds;
    const unread = $feeds?.filter((f) => f.newItemsCount) || [];
    const read = $feeds?.filter((f) => !f.newItemsCount) || [];
    return unread.concat(read);
  }, [feeds, hideEmailFeeds]);

  const { anchorRef } = usePopup(showOptions, () => setShowOptions(false));

  const list = (
    <ul>
      {feedsSorted?.map((uf) => {
        const hasNew = uf.newItemsCount > 0;
        const font = hasNew ? 'font-semibold text-white' : 'font-light text-gray-200';
        const bg = uf.id === id ? `bg-secondary` : '';
        return (
          <li key={uf.id} title={`${uf.newItemsCount || 0} new items`}>
            <Link href={`/feed/${uf.id}`}>
              <a
                className={`group flex items-center pl-3 focus:ring-2 focus:ring-secondary whitespace-nowrap w-full ${font} ${bg}`}
                onClick={() => onSidebarClose?.()}
              >
                {uf.feed.siteFavicon ? (
                  <img className="h-4 w-4 mr-1" src={uf.feed.siteFavicon} />
                ) : (
                  <span className="h-4 w-4 mr-1 flex-shrink-0" />
                )}

                <span className="overflow-ellipsis overflow-hidden group-hover:underline">
                  {uf.title || uf.feed.title || uf.feed.url}
                </span>
                {hasNew ? (
                  <>
                    <div
                      className="flex-shrink-0 ml-1 mt-1 w-1 h-1 rounded-full bg-gray-200
                  bg-opacity-70 group-hover:bg-opacity-100"
                    />
                    <div className="group-hover:text-white text-xs text-gray-400 self-center ml-auto">
                      {uf.newItemsCount}
                    </div>
                  </>
                ) : null}
              </a>
            </Link>
          </li>
        );
      })}
    </ul>
  );
  const content = loading ? <Spinner className="flex justify-center pt-3" /> : list;
  return (
    <div className="bg-sidebar h-full py-2 text-gray-50">
      <div className="flex mx-3">
        {onSidebarClose && (
          <button type="button" className="icon-btn" onClick={() => onSidebarClose()}>
            <XIcon className="w-4 max-h-full" />
          </button>
        )}
        <div className="relative ml-auto" ref={anchorRef as RefObject<HTMLDivElement>}>
          <button type="button" className="icon-btn" onClick={() => setShowOptions((s) => !s)}>
            <MoreIcon className="w-5" />
          </button>
          {showOptions && (
            <div className="absolute top-3/4 right-0 py-1 bg-white text-black text-xs md:translate-x-1/2 md:transform-gpu z-10 min-w-min rounded-sm border border-gray-600">
              <button
                type="button"
                className="whitespace-nowrap p-1 hover:bg-gray-300"
                onClick={() => setHideEmailFeeds((s) => !s)}
              >
                {hideEmailFeeds ? 'Show feeds with email digests' : 'Hide feeds with email digests'}
              </button>
            </div>
          )}
        </div>
      </div>
      <nav className="max-w-full text-sm pr-1 overflow-hidden">{content}</nav>
      {onAddFeedClick && (
        <button
          type="button"
          className="btn border border-gray-400 block mx-auto mt-8 hover:bg-secondary"
          onClick={() => onAddFeedClick()}
        >
          Add new feed
        </button>
      )}
    </div>
  );
};

export default FeedSidebar;
