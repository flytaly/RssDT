import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import EditIcon from '../../public/static/edit.svg';
import TrashIcon from '../../public/static/trash.svg';
import { useDeleteMyFeedsMutation, UserFeed } from '../generated/graphql';
import { SortableColumn, useSortableState } from '../hooks/use-sortableState';
import { periodNames } from '../types';
import { updateAfterDelete as update } from '../utils/update-after-delete';
import CheckBox from './forms/checkbox';
import AddFeedModal from './modals/add-feed-modal';
import ConfirmModal from './modals/confirm-modal';
import EditFeedModal from './modals/edit-feed-modal';

type FeedTableProps = {
  feeds: Array<UserFeed>;
};

interface CellProps {
  children: React.ReactNode;
  name?: string;
  header?: boolean;
  className?: string;
}

const Cell: React.FC<CellProps> = ({ children, className = '', name = '', header = false }) => {
  return React.createElement(
    header ? 'th' : 'td',
    { className: `feed-table-column ${className}`, 'data-name': name },
    children,
  );
};

interface RowProps {
  children: React.ReactNode;
  isOdd?: boolean;
}
const Row: React.FC<RowProps> = ({ children, isOdd = true }) => (
  <tr
    className={`grid feed-table-template gap-2 py-4 sm:py-1 hover:bg-primary-2 ${
      isOdd ? '' : 'bg-gray-200'
    }`}
  >
    {children}
  </tr>
);

const HeaderRow: React.FC = ({ children }) => (
  <tr className="feed-table-template hidden sm:grid gap-2 font-bold  py-4 sm:py-1 hover:bg-primary-2">
    {children}
  </tr>
);

const ConfirmDeleteMsg: React.FC<{ feeds: UserFeed[]; error?: string }> = ({ feeds, error }) => (
  <div>
    Are you sure you want to delete the feeds:{' '}
    <ul className="max-h-32 overflow-auto text-sm">
      {feeds.map((uf) => (
        <li key={uf.id}>
          <b>{uf.title || uf.feed.title}</b>
        </li>
      ))}
    </ul>
    <div className="text-error">{error}</div>
  </div>
);

const formatDigestDate = (date?: string) => (date ? new Date(date).toLocaleString() : '-');
const formatCreatedDate = (date: string) => new Date(date).toLocaleDateString();

const FeedTable: React.FC<FeedTableProps> = ({ feeds }) => {
  const [feedsToDelete, setFeedsToDelete] = useState<UserFeed[]>([]);
  const [editingFeed, setEditingFeed] = useState<UserFeed | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleteMyFeeds, { loading }] = useDeleteMyFeedsMutation();
  const { getSortIcon, incSort, sortState, sortUserFeeds } = useSortableState();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [addFeedModalOpen, setAddFeedModalOpen] = useState(false);

  const getHeaderButton = (col: SortableColumn, name: string) => (
    <button
      type="button"
      className="flex items-center font-bold w-full group"
      onClick={() => incSort(col)}
    >
      <span>{name}</span>
      {getSortIcon(col)}
    </button>
  );

  const closeModal = () => {
    setDeleteError('');
    setFeedsToDelete([]);
    setSelectedIds([]);
  };

  const sortedFeeds = useMemo(() => {
    if (!sortState.col || !sortState.dir) return feeds;
    return sortUserFeeds(feeds, sortState.col, sortState.dir);
  }, [feeds, sortState.col, sortState.dir, sortUserFeeds]);

  const onSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const id = parseInt(e.target.id);
    return e.target.checked
      ? setSelectedIds((prevIds) => [...prevIds, id])
      : setSelectedIds((prevIds) => prevIds.filter(($id) => $id === id));
  };
  const toggleAll = () =>
    setSelectedIds((prev) => {
      if (prev.length) return [];
      return sortedFeeds.map((f) => f.id);
    });
  const removeMultipleFeeds = () => {
    const ids = new Set(selectedIds);
    setFeedsToDelete(sortedFeeds.filter((f) => ids.has(f.id)));
  };

  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        {selectedIds.length ? (
          <span>
            <span>{`${selectedIds.length} selected feeds: `}</span>
            <button
              type="button"
              className="icon-btn inline-flex items-baseline px-1"
              onClick={removeMultipleFeeds}
            >
              <TrashIcon className="h-3 mr-1" />
              Remove
            </button>
          </span>
        ) : (
          <span />
        )}

        <button
          type="button"
          className="btn bg-secondary ml-auto"
          onClick={() => setAddFeedModalOpen(true)}
        >
          Add new feed
        </button>
      </div>
      {!sortedFeeds.length ? (
        <div className="text-center">You have no feeds</div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <HeaderRow>
              <Cell>
                <CheckBox
                  id="selectAll"
                  className="border-gray-400 hover:border-gray-600"
                  checked={selectedIds.length >= sortedFeeds.length}
                  onChange={toggleAll}
                />
              </Cell>
              <Cell name="Feed">{getHeaderButton('title', 'Feed')}</Cell>
              <Cell name="Added">{getHeaderButton('added', 'Added')}</Cell>
              <Cell name="Latest digest date">
                {getHeaderButton('digest_date', 'Latest digest date')}
              </Cell>
              <Cell name="Latest item pubdate">
                {getHeaderButton('item_pubdate', 'Latest item pubdate')}
              </Cell>
              <Cell name="Digest Schedule">Digest Schedule</Cell>
              <Cell name="Actions">Actions</Cell>
            </HeaderRow>
          </thead>
          <tbody>
            {sortedFeeds.map((uf, idx) => (
              <Row isOdd={!(idx % 2)} key={uf.id}>
                <Cell className="hidden sm:flex">
                  <CheckBox
                    id={`${uf.id}`}
                    className="border-gray-400 hover:border-gray-600"
                    checked={!!selectedIds.find((id) => id === uf.id)}
                    onChange={onSelectChange}
                  />
                </Cell>
                <Cell name="Feed">
                  <Link href={`/feed/${uf.id}`}>
                    <a className="underline">{uf.title || uf.feed.title}</a>
                  </Link>
                </Cell>
                <Cell className="text-xs" name="Added">
                  {formatCreatedDate(uf.createdAt)}
                </Cell>
                <Cell className="text-xs" name="Latest digest date">
                  {formatDigestDate(uf.lastDigestSentAt)}
                </Cell>
                <Cell className="text-xs" name="Latest item pubdate">
                  {formatDigestDate(uf.feed.lastPubdate)}
                </Cell>
                <Cell name="Digest Schedule">
                  {periodNames[uf.schedule] !== periodNames.disable ? (
                    <span className="font-medium">{periodNames[uf.schedule]}</span>
                  ) : (
                    <span className="text-gray-400">disabled</span>
                  )}
                </Cell>
                <Cell name="Actions">
                  <button onClick={() => setEditingFeed(uf)} type="button" className="icon-btn">
                    <EditIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setFeedsToDelete([uf])}
                    type="button"
                    className="icon-btn text-red-800"
                  >
                    <TrashIcon className="w-4 h-4 mr-1 " />
                  </button>
                </Cell>
              </Row>
            ))}
          </tbody>
        </table>
      )}
      <ConfirmModal
        isOpen={!!feedsToDelete.length}
        closeModal={closeModal}
        onConfirm={async () => {
          const ids = feedsToDelete.map(({ id }) => id);
          const result = await deleteMyFeeds({ variables: { ids }, update });
          if (result.errors?.length) setDeleteError("Couldn't delete feeds");
          else closeModal();
        }}
        disableButtons={loading}
        error={deleteError}
        message={<ConfirmDeleteMsg feeds={feedsToDelete} />}
      />
      <EditFeedModal
        feed={editingFeed}
        isOpen={!!editingFeed}
        closeModal={() => setEditingFeed(null)}
      />
      <AddFeedModal isOpen={addFeedModalOpen} closeModal={() => setAddFeedModalOpen(false)} />
    </div>
  );
};

export default FeedTable;
