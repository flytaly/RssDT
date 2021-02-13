import React from 'react';
import Image from 'next/image';
import PrimaryLink from './primary-link';

const DigestInfoBlock: React.FC = () => {
  return (
    <div className="space-y-7">
      <article>
        <h4 className="font-bold">Default and feed specific settings</h4>
        <div>
          Some settings have default state and feed specific state. The latter can be changed in the{' '}
          <PrimaryLink href="/manage">digest manager</PrimaryLink> by clicking on the settings icon
          in the <b>Actions</b> block. The default settings can be changed on the{' '}
          <PrimaryLink href="/settings">settings page</PrimaryLink>.
        </div>
        <div className="flex justify-center my-5 space-x-4">
          <span className="shadow-md hover:shadow-lg border border-gray-300">
            <Image
              src="/static/img/feed-settings-icon.png"
              alt="feed specific settings"
              width={414}
              height={280}
            />
          </span>
          <span className="shadow-md hover:shadow-lg border border-gray-300">
            <Image
              src="/static/img/feed-settings.png"
              alt="global digest settings"
              width={414}
              height={280}
            />
          </span>
        </div>
      </article>
      <article>
        <h4 className="font-bold">Choosing time and periods</h4>
        You can choose how often you want to receive digests. If you prefer daily digests you can
        also pick an hour of the digests in the{' '}
        <PrimaryLink href="/settings">settings page</PrimaryLink>
        .
        <br />
        <div className="flex justify-center my-2">
          <span className="shadow-md hover:shadow-lg border border-gray-300">
            <Image
              src="/static/img/settings-daily-digest-hour.png"
              alt="digest hour options"
              width={358}
              height={88}
            />
          </span>
        </div>
      </article>
      <article>
        <h4 className="font-bold">Table of content</h4>
        Table of content example
        <div className="flex flex-col my-2">
          <div className="flex justify-center my-2">
            <span className="shadow-md hover:shadow-lg border border-gray-300">
              <Image
                src="/static/img/toc-digest-example.png"
                alt="table of content"
                width={450}
                height={173}
              />
            </span>
          </div>
        </div>
      </article>
      <article>
        <h4 className="font-bold">Theme</h4>
        <div>Default vs text theme</div>
        <div className="flex justify-center my-5 space-x-4">
          <span className="shadow-md hover:shadow-lg border border-gray-300">
            <Image
              src="/static/img/theme-default.png"
              alt="default theme screenshot"
              width={450}
              height={345}
            />
          </span>
          <span className="shadow-md hover:shadow-lg border border-gray-300">
            <Image
              src="/static/img/theme-text.png"
              alt="only text theme screenshot"
              width={450}
              height={345}
            />
          </span>
        </div>
      </article>
    </div>
  );
};

export default DigestInfoBlock;
