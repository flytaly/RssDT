import React from 'react';
import { FeedFieldsFragment, UserFeedFieldsFragment } from '../generated/graphql';

type FeedTableProps = {
  feeds: Array<{ feed: FeedFieldsFragment } & UserFeedFieldsFragment>;
};

interface CellProps {
  children: React.ReactNode;
  name?: string;
  header?: boolean;
}

const Cell: React.FC<CellProps> = ({ children, name = '', header = false }) => {
  return React.createElement(
    header ? 'th' : 'td',
    { className: 'feed-table-column', 'data-name': name },
    <span className="flex-1">{children}</span>,
  );
};

interface RowProps {
  children: React.ReactNode;
  isOdd?: boolean;
}
const Row: React.FC<RowProps> = ({ children, isOdd = true }) => (
  <tr
    className={`grid feed-table-template gap-2 py-4 sm:py-1 hover:bg-primary-2 ${
      isOdd ? '' : 'bg-gray-1'
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

const FeedTable: React.FC<FeedTableProps> = ({ feeds }) => {
  const formatDigestDate = (date?: string) => (date ? new Date(date).toLocaleString() : '');
  const formatCreatedDate = (date: string) => new Date(date).toLocaleDateString();
  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <HeaderRow>
            <Cell name="Feed">Feed</Cell>
            <Cell name="Added">Added</Cell>
            <Cell name="Last digest date">Last digest date</Cell>
            <Cell name="Digest Schedule">Digest Schedule</Cell>
            <Cell name="Actions">Actions</Cell>
          </HeaderRow>
        </thead>
        <tbody>
          {feeds.map((uf, idx) => (
            <Row isOdd={!(idx % 2)} key={uf.id}>
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
        </tbody>
      </table>
    </div>
  );
};

export default FeedTable;
