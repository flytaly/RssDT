import Link from 'next/link';
import { useMeQuery } from '../../generated/graphql';
import { isServer } from '../../utils/is-server';

const NavBar = () => {
  const { data, loading } = useMeQuery({ skip: isServer() });
  let content: JSX.Element | null = null;

  if (loading) content = <div />;
  else if (data?.me) {
    content = (
      <>
        <Link href="/feeds/reader">
          <a className="hover-underline-link">reader</a>
        </Link>
        <Link href="/feeds/manage">
          <a className="hover-underline-link">manage</a>
        </Link>
        <Link href="/logout">
          <a className="hover-underline-link">{`logout (${data?.me.email})`}</a>
        </Link>
      </>
    );
  } else {
    content = (
      <Link href="/login">
        <a className="hover-underline-link">Log in</a>
      </Link>
    );
  }
  return <nav className="flex gap-x-2 text-sm">{content}</nav>;
};

export default NavBar;
