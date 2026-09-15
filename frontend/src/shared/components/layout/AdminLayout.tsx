import { useDashboardRealtime } from '@features/dashboard/hooks/useDashboardRealtime';
import { LoadingSpinner } from '@shared/components/ui/LoadingSpinner';
import { ExternalLink, FlaskConical, History, Menu, Radio, Tv, Users, X, Zap } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

interface NavItem {
  to: string;
  label: string;
  icon: typeof Radio;
  badge?: string;
  exact?: boolean;
}

export function AdminLayout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSocketConnected } = useDashboardRealtime();

  useEffect(() => {
    if (location.pathname) {
      setMobileMenuOpen(false);
    }
  }, [location.pathname]);

  const navLinks: NavItem[] = [
    {
      to: '/admin',
      label: 'Live Control Deck',
      icon: Radio,
      badge: 'LIVE',
      exact: true,
    },
    {
      to: '/admin/users',
      label: 'Audience & Chatters',
      icon: Users,
    },
    {
      to: '/admin/overlay-studio',
      label: 'Testing Overlay Lab',
      icon: FlaskConical,
      badge: 'LAB',
    },
    {
      to: '/admin/streams',
      label: 'Stream Archive',
      icon: History,
    },
    {
      to: '/admin/streamerbot',
      label: 'Streamer.bot Gateway',
      icon: Zap,
    },
  ];

  return (
    <div className="admin-shell min-h-screen flex flex-col md:flex-row bg-[#FAFAFA] text-[#18181B] font-sans antialiased">
      {/* ─── MOBILE TOP HEADER (< md) ────────────────────────────────────────── */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-[#FFFFFF] border-b border-[#D4D4D8]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#E4E4E7] border border-[#D4D4D8] flex items-center justify-center text-rose-500">
            <Radio className="w-4 h-4 animate-pulse text-rose-500" />
          </div>
          <div>
            <div className="text-xs font-bold font-sans uppercase text-[#18181B]">
              Stream Hub Pro
            </div>
            <div className="text-[10px] text-[#52525B]">@respati_stream</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isSocketConnected ? 'bg-[#10B981] shadow-[0_0_6px_#10B981]' : 'bg-[#F59E0B]'
            }`}
          />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-lg border border-[#D4D4D8] text-[#52525B] hover:text-[#18181B] hover:bg-[#E4E4E7]"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ─── MOBILE DRAWER (< md) ────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative w-64 max-w-[80vw] bg-[#FFFFFF] border-r border-[#D4D4D8] z-10 shadow-2xl flex flex-col h-full p-4 justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#D4D4D8]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#E4E4E7] border border-[#D4D4D8] flex items-center justify-center text-rose-500">
                    <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
                  </div>
                  <span className="text-sm font-bold text-[#18181B]">Stream Hub</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-[#52525B] hover:text-[#18181B] rounded-lg hover:bg-[#E4E4E7]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="space-y-1">
                {navLinks.map((item) => {
                  const isActive = item.exact
                    ? location.pathname === item.to
                    : location.pathname.startsWith(item.to);
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#E4E4E7] text-[#18181B] border border-[#18181B]/40'
                          : 'text-[#52525B] hover:bg-[#E4E4E7] hover:text-[#18181B]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 ${isActive ? 'text-[#18181B]' : 'text-[#52525B]'}`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#D4D4D8] text-[#52525B]">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-[#D4D4D8] space-y-2">
              <Link
                to="/overlay"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 text-xs rounded-lg bg-[#F4F4F5] border border-[#D4D4D8] text-[#52525B] hover:text-[#18181B]"
              >
                <div className="flex items-center gap-2">
                  <Tv className="w-3.5 h-3.5 text-[#18181B]" />
                  <span>OBS 1080p Overlay</span>
                </div>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* ─── DESKTOP TACTILE 72px SIDEBAR (>= md) ─────────────────────────────── */}
      <aside className="hidden md:flex w-[72px] h-screen sticky top-0 bg-[#FFFFFF] border-r border-[#D4D4D8] flex-col items-center justify-between py-4 select-none shrink-0 z-40">
        {/* Brand Logo Box */}
        <div className="flex flex-col items-center gap-4">
          <Link
            to="/admin"
            className="w-11 h-11 rounded-xl bg-[#E4E4E7] border border-[#D4D4D8] hover:border-[#18181B] flex items-center justify-center transition-all group relative"
            title="Stream Hub Pro Studio"
          >
            <Radio className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#10B981] ring-2 ring-[#FFFFFF]" />
          </Link>

          {/* Navigation Items Stack */}
          <nav className="flex flex-col items-center gap-2.5 mt-2">
            {navLinks.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all relative group ${
                    isActive
                      ? 'bg-[#E4E4E7] border border-[#18181B] text-[#18181B] shadow-[0_0_12px_rgba(24,24,27,0.08)]'
                      : 'bg-transparent text-[#52525B] hover:bg-[#E4E4E7] hover:text-[#18181B] border border-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5 transition-transform group-hover:scale-105" />

                  {/* Left Active Glow Indicator */}
                  {isActive && (
                    <span className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#18181B] rounded-r" />
                  )}

                  {/* Hover Tooltip Floating Right */}
                  <div className="absolute left-14 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#E4E4E7] border border-[#D4D4D8] shadow-lg text-xs font-medium text-[#18181B] whitespace-nowrap z-50 pointer-events-none">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#D4D4D8] text-[#18181B]">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Hardware & Telemetry Stack */}
        <div className="flex flex-col items-center gap-3">
          {/* OBS Transparent Source Shortcut */}
          <Link
            to="/overlay"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-xl bg-[#F4F4F5] border border-[#D4D4D8] hover:border-[#18181B] flex items-center justify-center text-[#52525B] hover:text-[#18181B] transition-all group relative"
            title="Buka OBS Browser Source (1080p Canvas)"
          >
            <Tv className="w-4 h-4" />
            <div className="absolute left-14 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 px-2 py-1 rounded bg-[#E4E4E7] border border-[#D4D4D8] text-xs font-medium text-[#18181B] whitespace-nowrap z-50 pointer-events-none">
              <span>OBS Stage</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </Link>

          {/* WebSocket Status Indicator Pill */}
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#F4F4F5] border border-[#D4D4D8] relative group"
            title={
              isSocketConnected ? 'WebSocket Streamerbot: Terhubung' : 'WebSocket: Menghubungkan...'
            }
          >
            <span
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                isSocketConnected
                  ? 'bg-[#10B981] shadow-[0_0_8px_#10B981]'
                  : 'bg-[#F59E0B] animate-pulse'
              }`}
            />
            <div className="absolute left-14 top-1/2 -translate-y-1/2 hidden group-hover:flex flex-col px-2.5 py-1.5 rounded-md bg-[#E4E4E7] border border-[#D4D4D8] text-[11px] text-[#18181B] whitespace-nowrap z-50 pointer-events-none">
              <span className="font-bold text-[#10B981]">
                {isSocketConnected ? 'WS CONNECTED' : 'WS CONNECTING'}
              </span>
              <span className="text-[10px] text-[#52525B]">ws://127.0.0.1:8080 • 0.8ms</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ──────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#FAFAFA] text-[#18181B]">
        <Suspense
          fallback={
            <div className="flex flex-1 w-full items-center justify-center min-h-[60vh]">
              <LoadingSpinner size="md" label="Loading view..." />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
