import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import ProfileIcon from '../../../public/static/user-circle-solid.svg';
import { useMeQuery } from '../../generated/graphql';
import { isServer } from '../../utils/is-server';
import HelpCircle from '../../../public/static/help-circle.svg';
import SettingsIcon from '../../../public/static/settings.svg';
import Spinner from '../spinner';

interface NavLinkProps {
  href: string;
  title: string;
  icon?: React.ReactNode;
  className?: string;
}

const NavLink: React.FC<NavLinkProps> = ({ className = '', href, title, icon }) => {
  const router = useRouter();
  return (
    <li className={className}>
      <Link href={href}>
        {icon ? (
          <button
            type="button"
            className="icon-btn flex items-center"
            title={title}
            onClick={() => router.push(href)}
          >
            {icon}
          </button>
        ) : (
          <a className="hover-underline-link">{title}</a>
        )}
      </Link>
    </li>
  );
};
const SubNavLink: React.FC<NavLinkProps> = ({ className = '', href, title }) => (
  <li className={className}>
    <Link href={href}>
      <a className="block hover:bg-primary hover:bg-opacity-30 p-2">{title}</a>
    </Link>
  </li>
);

const NavBar = () => {
  const { data, loading } = useMeQuery({ ssr: false });
  let content: JSX.Element | null = null;

  const help = <HelpCircle className="h-5" />;
  if (!loading) {
    if (data?.me) {
      content = (
        <>
          <NavLink href="/feed" title="Reader" />
          <NavLink href="/manage" title="Manage" />
          {/* <NavLink className="hidden sm:block" href="/settings" title="Settings" /> */}
          <NavLink href="/settings" title="Settings" icon={<SettingsIcon className="h-5" />} />
          <NavLink href="/help" title="Help" icon={help} />
          <li>
            <div className="group relative flex">
              <button type="button" className="icon-btn ">
                <ProfileIcon className="h-5" />
              </button>
              <ul className="hidden group-hover:block absolute top-full right-0 bg-primary-light bg-opacity-80 z-40 rounded-sm shadow-message hover:shadow-message-darker">
                {/* <SubNavLink className="block sm:hidden" href="/settings" title="Settings" /> */}
                <SubNavLink href="/logout" title="Logout" />
              </ul>
            </div>
          </li>
        </>
      );
    } else {
      content = (
        <>
          <NavLink href="/login" title="Log in" />
          <NavLink href="/register" title="Register" />
          <NavLink href="/help" title="Help" icon={help} />
        </>
      );
    }
  }
  return (
    <nav>
      {loading ? <Spinner /> : <ul className="flex items-center space-x-2 text-sm">{content}</ul>}
    </nav>
  );
};

export default NavBar;
