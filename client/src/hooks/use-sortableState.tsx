import React, { useState } from 'react';
import SortUpIcon from '../../public/static/sort-up.svg';
import SortDownIcon from '../../public/static/sort-down.svg';
import SortIcon from '../../public/static/sort.svg';
import { UserFeed } from '../generated/graphql';

export type SortableColumn = 'title' | 'added' | 'digest_date' | 'item_pubdate' | null;
export enum SortDirection {
  'Default' = 0,
  'Asc' = 1,
  'Desc' = 2,
}
export type SortState = {
  col?: SortableColumn;
  dir: SortDirection;
};

const compareFn = (a: any, b: any, dirCoeff: 1 | -1 = 1) => {
  if (a < b) return -1 * dirCoeff;
  if (a > b) return 1 * dirCoeff;
  return 0;
};

const sortUserFeeds = (feeds: UserFeed[], col: SortableColumn, dir: SortDirection) => {
  const feedCopy = [...feeds];
  const dirCoeff = dir === SortDirection.Desc ? 1 : -1;
  if (col === 'title')
    feedCopy.sort((a, b) => {
      const t1 = (a.title || a.feed.title || '').toLowerCase();
      const t2 = (b.title || b.feed.title || '').toLowerCase();
      return compareFn(t1, t2, dirCoeff);
    });

  if (col === 'added') feedCopy.sort((a, b) => compareFn(a.createdAt, b.createdAt, dirCoeff));
  if (col === 'digest_date')
    feedCopy.sort((a, b) => compareFn(a.lastDigestSentAt || 0, b.lastDigestSentAt || 0, dirCoeff));
  if (col === 'item_pubdate')
    feedCopy.sort((a, b) => compareFn(a.feed.lastPubdate || 0, b.feed.lastPubdate || 0, dirCoeff));
  return feedCopy;
};

export const useSortableState = () => {
  const [sortState, setSortState] = useState<SortState>({ col: null, dir: 0 });

  const incSort = (col: SortableColumn) =>
    setSortState((current) => {
      if (current.col === col) {
        return { col, dir: (current.dir + 1) % 3 };
      }
      return { col, dir: SortDirection.Asc } as SortState;
    });

  const getSortIcon = (col: SortableColumn) => {
    let Icon = SortIcon;
    let textColor = 'text-transparent group-hover:text-black';
    if (sortState.col === col) {
      if (sortState.dir === SortDirection.Asc) Icon = SortUpIcon;
      if (sortState.dir === SortDirection.Desc) Icon = SortDownIcon;
      if (sortState.dir) textColor = 'text-black';
    }
    return <Icon className={`ml-1 h-4 ${textColor}`} />;
  };

  return { incSort, sortState, getSortIcon, sortUserFeeds };
};