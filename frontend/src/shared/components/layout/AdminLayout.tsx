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
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* ─── MOBILE TOP HEADER (< md) ────────────────────────────────────────── */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-xs">
            <Radio className="w-4 h-4 animate-pulse text-rose-600" />
          </div>
          <div>
            <div className="text-xs font-bold font-sans uppercase tracking-tight text-slate-900">
              Stream Hub Pro
            </div>
            <div className="text-[10px] text-slate-500 font-mono">@respati_stream</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isSocketConnected ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]' : 'bg-amber-500'
            }`}
          />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative w-64 max-w-[80vw] bg-white border-r border-slate-200 z-10 shadow-2xl flex flex-col h-full p-4 justify-between animate-in slide-in-from-left duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-xs">
                    <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
                  </div>
                  <span className="text-sm font-bold text-slate-900">Stream Hub</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
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
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                            item.badge === 'LIVE'
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-2">
              <Link
                to="/overlay"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-xs font-medium"
              >
                <div className="flex items-center gap-2">
                  <Tv className="w-3.5 h-3.5 text-indigo-600" />
                  <span>OBS 1080p Overlay</span>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* ─── DESKTOP TACTILE 72px SIDEBAR (>= md) ─────────────────────────────── */}
      <aside className="hidden md:flex w-[72px] h-screen sticky top-0 bg-white border-r border-slate-200/90 flex-col items-center justify-between py-4 select-none shrink-0 z-40 shadow-xs">
        {/* Brand Logo Box */}
        <div className="flex flex-col items-center gap-4">
          <Link
            to="/admin"
            className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-50 to-slate-100 border border-indigo-200/80 hover:border-indigo-400 flex items-center justify-center transition-all shadow-xs group relative"
            title="Stream Hub Pro Studio"
          >
            <Radio className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white shadow-xs" />
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
                      ? 'bg-indigo-50/90 border border-indigo-300 text-indigo-600 shadow-xs'
                      : 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5 transition-transform group-hover:scale-105" />

                  {/* Left Active Glow Indicator */}
                  {isActive && (
                    <span className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-indigo-600 rounded-r shadow-xs" />
                  )}

                  {/* Hover Tooltip Floating Right */}
                  <div className="absolute left-14 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 shadow-xl text-xs font-semibold text-white whitespace-nowrap z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          item.badge === 'LIVE'
                            ? 'bg-rose-500 text-white'
                            : 'bg-amber-400 text-slate-900'
                        }`}
                      >
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
            className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 flex items-center justify-center text-slate-600 hover:text-indigo-600 transition-all shadow-xs group relative"
            title="Buka OBS Browser Source (1080p Canvas)"
          >
            <Tv className="w-4 h-4" />
            <div className="absolute left-14 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-white whitespace-nowrap z-50 pointer-events-none shadow-xl">
              <span>OBS Stage 1080p</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </div>
          </Link>

          {/* WebSocket Status Indicator Pill */}
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 relative group shadow-xs cursor-pointer"
            title={
              isSocketConnected ? 'WebSocket Streamerbot: Terhubung' : 'WebSocket: Menghubungkan...'
            }
          >
            <span
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                isSocketConnected
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                  : 'bg-amber-500 animate-pulse'
              }`}
            />
            <div className="absolute left-14 top-1/2 -translate-y-1/2 hidden group-hover:flex flex-col px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-white whitespace-nowrap z-50 pointer-events-none shadow-xl">
              <span className="font-bold text-emerald-400">
                {isSocketConnected ? 'WS CONNECTED' : 'WS CONNECTING'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">ws://127.0.0.1:8080 • 0.8ms</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ──────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#F8FAFC] text-slate-900">
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
