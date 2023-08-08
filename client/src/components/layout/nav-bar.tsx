import Link from 'next/link';
import React from 'react';

import HelpCircle from '@/../public/static/help-circle.svg';
import MailIcon from '@/../public/static/mail.svg';
import SettingsIcon from '@/../public/static/settings.svg';
import ProfileIcon from '@/../public/static/user-circle-solid.svg';
import Spinner from '@/components/spinner';
import { useMeQuery } from '@/generated/graphql';

interface NavLinkProps {
  href: string;
  title: string;
  icon?: React.ReactNode;
  className?: string;
}

const NavLink = ({ className = '', href, title, icon }: NavLinkProps) => {
  return (
    <li className={className}>
      <Link
        href={href}
        className="hover-underline-link flex items-center hover:text-primary-dark icon-btn"
        title={title}
      >
        {icon || title}
      </Link>
    </li>
  );
};

const SubNavLink = ({ className = '', href, title }: NavLinkProps) => (
  <li className={className}>
    <Link href={href} className="block hover:bg-primary hover:bg-opacity-30 p-2">
      {title}
    </Link>
  </li>
);

const NavBar = () => {
  const { data, loading } = useMeQuery({ ssr: false });
  let links: JSX.Element | null = null;

  const help = <HelpCircle className="h-5" />;
  if (loading) return <Spinner />;
  if (data?.me) {
    links = (
      <>
        <NavLink href="/feed" title="Reader" />
        <NavLink href="/manage" title="Manage" icon={<MailIcon className="h-5" />} />
        <NavLink href="/settings" title="Settings" icon={<SettingsIcon className="h-5" />} />
        <NavLink href="/help" title="Help" icon={help} />
        <li>
          <div className="group relative flex">
            <button type="button" className="icon-btn ">
              <ProfileIcon className="h-5" />
            </button>
            <ul className="hidden group-hover:block absolute top-full right-0 bg-primary-light bg-opacity-80 z-40 rounded-sm shadow-message hover:shadow-message-darker">
              <SubNavLink href="/logout" title="Logout" />
            </ul>
          </div>
        </li>
      </>
    );
  } else {
    links = (
      <>
        <NavLink href="/login" title="Log in" />
        <NavLink href="/register" title="Register" />
        <NavLink href="/help" title="Help" icon={help} />
      </>
    );
  }
  return (
    <nav>
      <ul className="flex items-center space-x-2 text-sm">{links}</ul>
    </nav>
  );
};

export default NavBar;
