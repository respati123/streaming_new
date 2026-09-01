import { Button } from '@shared/components/ui/Button';
import { LanguageSwitcher } from '@shared/components/ui/LanguageSwitcher';
import { ThemeToggle } from '@shared/components/ui/ThemeToggle';
import { useTranslation } from '@shared/hooks/useTranslation';
import { useAuthStore } from '@shared/stores/auth.store';
import type { NavLinkItem } from '@shared/types/layout.types';
import {
  RiBookOpenLine,
  RiBroadcastFill,
  RiInboxLine,
} from 'react-icons/ri';
import { Link, useLocation } from 'react-router-dom';

export function Navbar() {
  const location = useLocation();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const navLinks: NavLinkItem[] = [
    { label: t('nav.products'), path: '/products', icon: <RiInboxLine className="text-base" /> },
    { label: t('nav.docs'), path: '/docs', icon: <RiBookOpenLine className="text-base" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md font-sans">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-tactile border border-zinc-800">
              <RiBroadcastFill className="text-rose-500 text-xl" />
            </div>
            <div>
              <span className="text-sm font-extrabold tracking-tight text-zinc-950 flex items-center gap-1.5 font-mono uppercase">
                {t('common.appName')}
              </span>
              <p className="text-[10px] uppercase font-mono font-semibold tracking-wider text-zinc-400">
                {t('common.appSubtitle')}
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav data-testid="navbar-links" className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.path);
            const testId = `nav-link-${link.path.replace('/', '')}`;
            return (
              <Link
                key={link.path}
                to={link.path}
                data-testid={testId}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-zinc-950 text-white shadow-tactile'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Tools & User Profile */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <LanguageSwitcher />

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3 ml-1">
              <div className="hidden sm:flex flex-col text-right font-sans">
                <span className="text-xs font-bold text-zinc-950">
                  {user.name}
                </span>
                <span className="text-[10px] font-mono text-zinc-400">{user.email}</span>
              </div>
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-zinc-200"
              />
              <Button variant="ghost" size="sm" onClick={logout}>
                {t('common.logout')}
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="primary" size="sm">
                {t('common.signIn')}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
