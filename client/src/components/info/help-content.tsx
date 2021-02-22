import React from 'react';
import PrimaryLink from './primary-link';
import DigestInfoBlock from './digest-info-block';
import FilterInfoBlock from './filter-info-block';

type HelpSection = {
  id: string;
  title: React.ReactNode;
  body: React.ReactNode;
};

const helpArticles: HelpSection[] = [
  {
    id: 'about',
    title: 'About',
    body: (
      <span>
        FeedMailu is an RSS/Atom reader that also can aggregate your feeds into digests and send
        them to you via email. To start receiving digests just enter an address of the desired feed,
        email, and digest period on the <PrimaryLink href="/settings">start page</PrimaryLink>. To
        use feed reader you should <PrimaryLink href="/register">register</PrimaryLink>.
      </span>
    ),
  },
  {
    id: 'period',
    title: 'Digest settings',
    body: <DigestInfoBlock />,
  },
  {
    id: 'filter',
    title: 'Filter items',
    body: <FilterInfoBlock />,
  },
];

const HelpContent: React.FC = () => {
  return (
    <div className="flex flex-col sm:flex-row mb-4">
      <aside className="sticky top-0 self-start text-sm px-3 py-3 m-2 w-full sm:w-72">
        <nav>
          <ul className="space-y-2 list-disc ml-2 sm:list-none sm:ml-0">
            {helpArticles.map((item) => (
              <li key={`nav_${item.id}`}>
                <a className="hover:underline hover:text-primary-dark" href={`#${item.id}`}>
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <section className="m-2 p-2 space-y-7 ">
        {helpArticles.map((item) => {
          return (
            <article id={item.id} key={item.id}>
              <h3 className="font-bold mb-2 text-lg text-primary-dark">{item.title}</h3>
              <div>{item.body}</div>
            </article>
          );
        })}
      </section>
    </div>
  );
};

export default HelpContent;
