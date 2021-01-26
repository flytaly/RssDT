import Link from 'next/link';
import { useSpring } from 'react-spring';
import { useMeQuery } from '../../generated/graphql';
import { isServer } from '../../utils/is-server';
import ProfileIcon from '../../../public/static/user-circle-solid.svg';

interface NavLinkProps {
  href: string;
  title: string;
  className?: string;
}

const NavLink: React.FC<NavLinkProps> = ({ className = '', href, title }) => (
  <li className={className}>
    <Link href={href}>
      <a className="hover-underline-link">{title}</a>
    </Link>
  </li>
);
const SubNavLink: React.FC<NavLinkProps> = ({ className = '', href, title }) => (
  <li className={className}>
    <Link href={href}>
      <a className="block hover:bg-primary hover:bg-opacity-30 p-2">{title}</a>
    </Link>
  </li>
);

const NavBar = () => {
  const { data, loading } = useMeQuery({ skip: isServer() });
  let content: JSX.Element | null = null;

  if (loading) content = <div />;
  else if (data?.me) {
    content = (
      <>
        <NavLink href="/feeds/reader" title="Reader" />
        <NavLink href="/feeds/manage" title="Manage" />
        <NavLink className="hidden sm:block" href="/settings" title="Settings" />
        <li>
          <div className="group relative flex">
            <button type="button" className="icon-btn ">
              <ProfileIcon className="h-5" />
            </button>
            <ul className="hidden group-hover:block absolute top-full right-0 bg-primary-light bg-opacity-80 z-10 rounded-sm shadow-message hover:shadow-message-darker">
              <SubNavLink className="block sm:hidden" href="/settings" title="Settings" />
              <SubNavLink href="/logout" title="Logout" />
            </ul>
          </div>
        </li>
      </>
    );
  } else {
    content = (
      <li>
        <Link href="/login">
          <a className="hover-underline-link">Log in</a>
        </Link>
      </li>
    );
  }
  return (
    <nav>
      <ul className="flex items-center space-x-2 text-sm">{content}</ul>
    </nav>
  );
};

export default NavBar;
