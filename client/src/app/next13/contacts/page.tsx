import BigCard from '@/app/big-card';
import InfoNavBar from '@/components/main-card/info-nav-bar';

import Contacts from './contacts';

export default function ContactsPage() {
  return (
    <BigCard big>
      <div className="flex flex-col w-full h-full">
        <InfoNavBar />
        <section className="flex-grow">
          <Contacts />
        </section>
      </div>
    </BigCard>
  );
}
