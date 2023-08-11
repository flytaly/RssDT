import MainCard from '@/app/main-card';
import { MessageItem } from '@/components/main-card/animated-message';
import FormSide from '@/components/main-card/form-side';
import MessageBlock from '@/components/message-block';

import { AddFeedForm } from './add-feed-form';

export default async function Page() {
  const items: MessageItem[] = [];
  return (
    <MainCard>
      <section className="relative flex-grow flex flex-col items-center rounded-md p-3 md:w-1/2">
        <MessageBlock items={items} />
      </section>
      <FormSide>
        <h2 className="text-xl font-bold mb-4 text-center">Add a feed</h2>
        <AddFeedForm />
      </FormSide>
    </MainCard>
  );
}
