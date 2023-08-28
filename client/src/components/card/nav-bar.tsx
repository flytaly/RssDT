import Link from 'next/link';

export type CardRoute = {
  name: string;
  path: string;
};

export type CardNavBarProps = {
  title: string;
  routes: CardRoute[];
  activePath: string | null;
  children?: React.ReactNode;
};

export default function CardNavBar({ routes, title, activePath, children }: CardNavBarProps) {
  return (
    <header className="flex justify-between items-start border-b border-gray pt-1 pb-2 pl-4 pr-2">
      <div>
        <div className="text-lg text-primary-dark font-bold">{title}</div>
        <nav className="flex text-sm space-x-4">
          {routes.map((r) => (
            <Link
              key={r.path}
              href={r.path}
              className={`hover-underline-link ${r.path === activePath ? 'active' : ''}`}
            >
              {r.name}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </header>
  );
}
