import { MessageItem } from '@/components/card/animated-message';
import MessagesSide from '@/components/card/messages-side';
import SmallCard from '@/components/card/small-card';
import { getGQLClient } from '@/lib/gqlClient.server';

import Unsubscribing from './unsubscribing';

const notEnoughInfoMsg: MessageItem = {
  key: 'query-error',
  text: 'No token or id provided in the URL',
  type: 'error',
  static: true,
};

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SmallCard>
      <div className="flex flex-col items-center w-full h-full text-center p-4 mt-6">
        {children}
      </div>
    </SmallCard>
  );
}

export default async function Unsubscribe({
  searchParams: { id, token },
}: {
  searchParams: { id?: string; token?: string };
}) {
  if (!id || !token) {
    return (
      <Wrapper>
        <MessagesSide items={[notEnoughInfoMsg]} />
      </Wrapper>
    );
  }

  const info = await getGQLClient().getFeedInfoByToken({ id, token });
  if (!info.getFeedInfoByToken?.feed) {
    return (
      <Wrapper>
        <MessagesSide
          items={[
            { key: 'query-error', text: 'Could not get informatino about feed', type: 'error' },
          ]}
        />
      </Wrapper>
    );
  }

  const { title, url } = info.getFeedInfoByToken.feed;

  return (
    <Wrapper>
      <div>
        <div>Click on the button to unsubscribe from the feed</div>
        {url ? (
          <a className="font-bold hover:underline" href={url}>
            {title || url}
          </a>
        ) : null}
      </div>
      <Unsubscribing userFeedId={id} token={token} />
    </Wrapper>
  );
}
