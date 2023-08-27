import CardNavBar, { CardRoute } from './nav-bar';

const routes: CardRoute[] = [
  { name: 'Help', path: '/help' },
  { name: 'Contacts', path: '/contacts' },
];

const InfoNavBar = ({ pathname }: { pathname: '/help' | '/contacts' }) => {
  return <CardNavBar title="Information" routes={routes} activePath={pathname} />;
};

export default InfoNavBar;
