'use client';

import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

import HelpCircle from '@/../public/static/help-circle.svg';
import MailIcon from '@/../public/static/mail.svg';
import SettingsIcon from '@/../public/static/settings.svg';
import ProfileIcon from '@/../public/static/user-circle-solid.svg';
import { getGQLClient } from '@/app/lib/gqlClient.client';

interface NavLinkProps {
  href: string;
  title: string;
  icon?: React.ReactNode;
  className?: string;
}

function NavLink({ className = '', href, title, icon }: NavLinkProps) {
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
}

function NavWrapper({ children }: { children: React.ReactNode }) {
  return (
    <nav>
      <ul className="flex items-center space-x-2 text-sm">{children}</ul>
    </nav>
  );
}

function LoggedInNavBar() {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: async () => {
      await getGQLClient().logout();
      router.refresh();
    },
  });
  return (
    <NavWrapper>
      <NavLink href="/feed" title="Reader" />
      <NavLink href="/manage" title="Manage" icon={<MailIcon className="h-5" />} />
      <NavLink href="/settings" title="Settings" icon={<SettingsIcon className="h-5" />} />
      <NavLink href="/help" title="Help" icon={<HelpCircle className="h-5" />} />
      <li>
        <div className="group relative flex">
          <button type="button" className="icon-btn ">
            <ProfileIcon className="h-5" />
          </button>
          <ul className="hidden group-hover:block absolute top-full right-0 bg-primary-light bg-opacity-80 z-40 rounded-sm shadow-message hover:shadow-message-darker">
            <li>
              <button
                className="block hover:bg-primary hover:bg-opacity-30 p-2"
                onClick={() => {
                  mutation.mutate();
                }}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </li>
    </NavWrapper>
  );
}

export default function NavBar({ isLoggedIn }: { isLoggedIn: boolean }) {
  if (isLoggedIn) {
    return <LoggedInNavBar />;
  }
  return (
    <NavWrapper>
      <NavLink href="/login" title="Log in" />
      <NavLink href="/register" title="Register" />
      <NavLink href="/help" title="Help" icon={<HelpCircle className="h-5" />} />
    </NavWrapper>
  );
}
