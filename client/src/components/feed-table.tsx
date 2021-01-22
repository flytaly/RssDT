import React from 'react';
import { FeedFieldsFragment, UserFeedFieldsFragment } from '../generated/graphql';

type FeedTableProps = {
  feeds: Array<{ feed: FeedFieldsFragment } & UserFeedFieldsFragment>;
};

interface CellProps {
  children: React.ReactNode;
  name: string;
}

const Cell: React.FC<CellProps> = ({ children, name }) => (
  <span className="flex-1 feed-table-column" data-name={name}>
    {children}
  </span>
);

interface RowProps {
  children: React.ReactNode;
  isOdd?: boolean;
}
const Row: React.FC<RowProps> = ({ children, isOdd = true }) => (
  <li className={`feed-table gap-2 py-4 sm:py-1 hover:bg-primary-2 ${isOdd ? '' : 'bg-gray-1'}`}>
    {children}
  </li>
);

const HeaderRow: React.FC = ({ children }) => (
  <li className="feed-table gap-2 font-bold  py-4 sm:py-1 hover:bg-primary-2">{children}</li>
);

const FeedTable: React.FC<FeedTableProps> = ({ feeds }) => {
  const formatDigestDate = (date?: string) => (date ? new Date(date).toLocaleString() : '');
  const formatCreatedDate = (date: string) => new Date(date).toLocaleDateString();
  return (
    <ul className="text-sm">
      <HeaderRow>
        <Cell name="Feed">Feed</Cell>
        <Cell name="Added">Added</Cell>
        <Cell name="Last digest date">Last digest date</Cell>
        <Cell name="Digest Schedule">Digest Schedule</Cell>
        <Cell name="Actions">Actions</Cell>
      </HeaderRow>

      {feeds.map((uf, idx) => (
        <Row isOdd={!(idx % 2)}>
          <Cell name="Feed">
            <a className="underline" href={uf.feed.link || uf.feed.url}>
              {uf.feed.title}
            </a>
          </Cell>
          <Cell name="Added">{formatCreatedDate(uf.createdAt)}</Cell>
          <Cell name="Last digest date">{formatDigestDate(uf.lastDigestSentAt)}</Cell>
          <Cell name="Digest Schedule">{uf.schedule}</Cell>
          <Cell name="Actions">actions</Cell>
        </Row>
      ))}
    </ul>
  );
};

export default FeedTable;
