import React from 'react';
import Input from './forms/input';
import RssSquareIcon from '../../public/static/rss-square.svg';
import MailIcon from '../../public/static/envelope.svg';
import ClockIcon from '../../public/static/clock.svg';
import Select from './forms/select';
import { periodNames as names, DigestSchedule } from '../types';

const WelcomeCard = () => {
  return (
    <article className="flex flex-col md:flex-row small-card-w w-96 bg-gray-200 rounded-md">
      <section className="flex-grow flex flex-col items-center rounded-md p-3 md:w-1/2">
        Messages
      </section>
      <section className="flex-grow bg-gray-300 bg-opacity-60 rounded-md border-1 border-gray-500 border-solid border p-3 px-12 md:w-1/2">
        <div className="flex flex-col items-center max-w-xs ">
          <h2 className="text-xl font-bold mb-4">Add a feed</h2>
          <Input IconSVG={RssSquareIcon} />
          <Input IconSVG={MailIcon} />
          <Select IconSVG={ClockIcon}>
            {Object.values(DigestSchedule).map((sc) => (
              <option key={sc} value={sc}>{`${names[sc]} digest`}</option>
            ))}
          </Select>
          <button type="submit" className="btn w-full text-xl tracking-wider">
            subscribe
          </button>
        </div>
      </section>
    </article>
  );
};

export default WelcomeCard;
