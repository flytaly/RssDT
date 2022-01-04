import React, { useEffect, useRef, useState } from 'react';
import { ItemFieldsFragment } from '../../generated/graphql';
import FeedItemContent from './feed-item-content';
import { ReaderOptions } from './reader-options';

interface FeedItemProps {
  item: ItemFieldsFragment;
  readerOpts: ReaderOptions;
  onItemClick?: (id: number) => void;
  isNew?: boolean;
}

export const fontSizes = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl'];

const FeedItem: React.FC<FeedItemProps> = ({ item, readerOpts, onItemClick, isNew }) => {
  const [isOverflown, setIsOverflown] = useState(false);
  const ref = useRef<HTMLElement>(null);

  const isCollapsed = readerOpts.itemView === 'collapsed';
  const isMedium = readerOpts.itemView === 'medium';
  const isFullHeight = readerOpts.itemView === 'full';
  const limitHeight = isMedium ? 'max-h-36' : '';

  useEffect(() => {
    if (isFullHeight && isOverflown) {
      setIsOverflown(false);
      return;
    }
    if (!isMedium) return;
    const el = ref.current;
    if (!el || isOverflown) return;
    const checkOverflow = () => {
      if (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth) {
        setIsOverflown(true);
      }
    };
    checkOverflow();
    el.querySelectorAll('img').forEach((img) => {
      if (!isOverflown) {
        img.onload = () => checkOverflow();
      }
    });
  }, [isFullHeight, isMedium, isOverflown]);

  return (
    <FeedItemContent
      item={item}
      containerClassName={fontSizes[readerOpts.fontSize]}
      bodyClassName={`overflow-hidden ${limitHeight}`}
      showBody={!isCollapsed}
      bodyRef={ref}
      bottomGradient={isOverflown}
      bodyClickHandler={isOverflown || isCollapsed ? onItemClick : undefined}
      isNew={isNew}
    />
  );
};

export default FeedItem;
