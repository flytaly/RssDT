import { useMeQuery } from '../../generated/graphql';
import { isServer } from '../../utils/is-server';

const NavBar = () => {
  const { data, loading } = useMeQuery({ skip: isServer() });
  let content: JSX.Element | null = null;

  if (loading) content = <div />;
  else if (data?.me) {
    content = <div>{`Logged in (${data?.me.email})`}</div>;
  } else {
    content = <div>Logged out</div>;
  }
  return <nav>{content}</nav>;
};

export default NavBar;
