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
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0A0A0E] text-[#F4F4F6] font-sans antialiased">
      {/* ─── MOBILE TOP HEADER (< md) ────────────────────────────────────────── */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-[#131318] border-b border-[#272733]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1A1A22] border border-[#272733] flex items-center justify-center text-rose-500">
            <Radio className="w-4 h-4 animate-pulse text-rose-500" />
          </div>
          <div>
            <div className="text-xs font-bold font-sans uppercase text-[#F4F4F6]">
              Stream Hub Pro
            </div>
            <div className="text-[10px] text-[#A0A0AC]">@respati_stream</div>
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
            className="p-1.5 rounded-lg border border-[#272733] text-[#A0A0AC] hover:text-[#F4F4F6] hover:bg-[#1A1A22]"
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
          <aside className="relative w-64 max-w-[80vw] bg-[#131318] border-r border-[#272733] z-10 shadow-2xl flex flex-col h-full p-4 justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#272733]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#1A1A22] border border-[#272733] flex items-center justify-center text-rose-500">
                    <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
                  </div>
                  <span className="text-sm font-bold text-[#F4F4F6]">Stream Hub</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-[#A0A0AC] hover:text-[#F4F4F6] rounded-lg hover:bg-[#1A1A22]"
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
                          ? 'bg-[#1A1A22] text-[#06B6D4] border border-[#06B6D4]/40'
                          : 'text-[#A0A0AC] hover:bg-[#1A1A22] hover:text-[#F4F4F6]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 ${isActive ? 'text-[#06B6D4]' : 'text-[#A0A0AC]'}`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#272733] text-[#A0A0AC]">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-[#272733] space-y-2">
              <Link
                to="/overlay"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 text-xs rounded-lg bg-[#16161D] border border-[#272733] text-[#A0A0AC] hover:text-[#F4F4F6]"
              >
                <div className="flex items-center gap-2">
                  <Tv className="w-3.5 h-3.5 text-[#06B6D4]" />
                  <span>OBS 1080p Overlay</span>
                </div>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* ─── DESKTOP TACTILE 72px SIDEBAR (>= md) ─────────────────────────────── */}
      <aside className="hidden md:flex w-[72px] h-screen sticky top-0 bg-[#131318] border-r border-[#272733] flex-col items-center justify-between py-4 select-none shrink-0 z-40">
        {/* Brand Logo Box */}
        <div className="flex flex-col items-center gap-4">
          <Link
            to="/admin"
            className="w-11 h-11 rounded-xl bg-[#1A1A22] border border-[#272733] hover:border-[#06B6D4] flex items-center justify-center transition-all group relative"
            title="Stream Hub Pro Studio"
          >
            <Radio className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#10B981] ring-2 ring-[#131318]" />
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
                      ? 'bg-[#1A1A22] border border-[#06B6D4] text-[#06B6D4] shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                      : 'bg-transparent text-[#A0A0AC] hover:bg-[#1A1A22] hover:text-[#F4F4F6] border border-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5 transition-transform group-hover:scale-105" />

                  {/* Left Active Glow Indicator */}
                  {isActive && (
                    <span className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#06B6D4] rounded-r" />
                  )}

                  {/* Hover Tooltip Floating Right */}
                  <div className="absolute left-14 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#1A1A22] border border-[#272733] shadow-lg text-xs font-medium text-[#F4F4F6] whitespace-nowrap z-50 pointer-events-none">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#272733] text-[#06B6D4]">
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
            className="w-10 h-10 rounded-xl bg-[#16161D] border border-[#272733] hover:border-[#06B6D4] flex items-center justify-center text-[#A0A0AC] hover:text-[#06B6D4] transition-all group relative"
            title="Buka OBS Browser Source (1080p Canvas)"
          >
            <Tv className="w-4 h-4" />
            <div className="absolute left-14 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 px-2 py-1 rounded bg-[#1A1A22] border border-[#272733] text-xs font-medium text-[#F4F4F6] whitespace-nowrap z-50 pointer-events-none">
              <span>OBS Stage</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </Link>

          {/* WebSocket Status Indicator Pill */}
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#16161D] border border-[#272733] relative group"
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
            <div className="absolute left-14 top-1/2 -translate-y-1/2 hidden group-hover:flex flex-col px-2.5 py-1.5 rounded-md bg-[#1A1A22] border border-[#272733] text-[11px] text-[#F4F4F6] whitespace-nowrap z-50 pointer-events-none">
              <span className="font-bold text-[#10B981]">
                {isSocketConnected ? 'WS CONNECTED' : 'WS CONNECTING'}
              </span>
              <span className="text-[10px] text-[#A0A0AC]">ws://127.0.0.1:8080 • 0.8ms</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ──────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#0A0A0E] text-[#F4F4F6]">
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
