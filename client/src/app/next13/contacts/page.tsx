import MainCard from '@/app/main-card';
import InfoNavBar from '@/components/main-card/info-nav-bar';

import Contacts from './contacts';

export default function ContactsPage() {
  return (
    <MainCard big>
      <div className="flex flex-col w-full h-full">
        <InfoNavBar />
        <section className="flex-grow">
          <Contacts />
        </section>
      </div>
    </MainCard>
  );
}
