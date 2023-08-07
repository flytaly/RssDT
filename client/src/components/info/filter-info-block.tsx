import React from 'react';

import SearchIcon from '@/../public/static/search.svg';

import PrimaryLink from './primary-link';

const FilterInfoBlock = () => {
  return (
    <div>
      It&apos;s possible to filter items based on their titles. Filter query should consist of words
      and phrases separated by commas. You can test queries in{' '}
      <PrimaryLink href="/feed">the feed reader</PrimaryLink> after selecting feed and clicking on
      the search icon <SearchIcon className="inline h-4 w-auto" />.
      <div className="font-semibold mt-3">Operators and examples</div>
      <ul className="mt-2 space-y-2">
        <li>
          <span className="font-mono font-semibold bg-gray-300 px-1">,&nbsp;|</span>
          <span className="ml-5">
            select items that <b>contain any</b> of the given words
          </span>
          <div className="ml-8">
            <span className="font-mono bg-gray-300 px-1">cat, dog</span>
            <span> - items with words &apos;cat&apos; or &apos;dog&apos;, </span>
            <span>the same as </span>
            <span className="font-mono bg-gray-300 px-1">cat|dog</span>
          </div>
        </li>
        <li>
          <span className="font-mono font-semibold bg-gray-300 px-1">&nbsp;&nbsp;+</span>
          <span className="ml-5">
            select items that <b>contain all</b> of the given words
          </span>
          <div className="ml-8">
            <span className="font-mono bg-gray-300 px-1">cat dog</span>
            <span> - items with words &apos;cat&apos; and &apos;dog&apos;, </span>
            <span>the same as </span>
            <span className="font-mono bg-gray-300 px-1">cat+dog</span>
          </div>
        </li>
        <li>
          <span className="font-mono font-semibold bg-gray-300 px-1">-&nbsp;!</span>
          <span className="ml-5">
            select items that <b>don&apos;t contain</b> given word
          </span>
          <div className="ml-8">
            <span className="font-mono bg-gray-300 px-1">!cat</span>
            <span> - items without word &apos;cat&apos;, </span>
            <span>the same as </span>
            <span className="font-mono bg-gray-300 px-1">-cat</span>.
            <span> If the word have hypens wrap it in quotes </span>
            <span className="font-mono bg-gray-300 px-1">&quot;long-term&quot;</span>.
          </div>
        </li>
        <div>Combinations:</div>
        <li>
          <span className="font-mono bg-gray-300 px-1">bird+(cat,dog)</span>
          <span> &apos;bird&apos; and &apos;cat or dog&apos;</span>
        </li>
        <li>
          <span className="font-mono bg-gray-300 px-1">cat !dog, bird</span>
          <span> &apos;cat without dog&apos; or &apos;bird&apos;</span>
        </li>
      </ul>
    </div>
  );
};

export default FilterInfoBlock;
