import { useDashboardRealtime } from '@features/dashboard/hooks/useDashboardRealtime';
import { LoadingSpinner } from '@shared/components/ui/LoadingSpinner';
import { Suspense, useEffect, useState } from 'react';
import {
  RiBroadcastFill,
  RiBroadcastLine,
  RiCloseLine,
  RiExternalLinkLine,
  RiFlashlightLine,
  RiGroupLine,
  RiHistoryLine,
  RiMenuLine,
  RiTvLine,
} from 'react-icons/ri';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

export function AdminLayout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSocketConnected } = useDashboardRealtime();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isConnected = isSocketConnected;

  const navLinks = [
    {
      to: '/admin',
      label: 'Live Control Deck',
      icon: RiBroadcastLine,
      badge: 'LIVE',
      exact: true,
    },
    {
      to: '/admin/users',
      label: 'Audience & Chatters',
      icon: RiGroupLine,
    },
    {
      to: '/admin/streams',
      label: 'Stream Archive',
      icon: RiHistoryLine,
    },
    {
      to: '/admin/overlay-studio',
      label: 'Overlay Studio & Lab',
      icon: RiTvLine,
      badge: 'TEST',
    },
    {
      to: '/admin/streamerbot',
      label: 'Streamer.bot Gateway',
      icon: RiFlashlightLine,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Brand & Station Header */}
        <div className="p-4 border-b border-zinc-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-950 flex items-center justify-center text-white shadow-sm ring-1 ring-zinc-800">
                <RiBroadcastFill className="text-rose-500 animate-pulse text-lg" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold tracking-tight text-zinc-950 uppercase font-mono">
                  Stream Hub Pro
                </div>
                <div className="text-[11px] text-zinc-500 font-mono truncate">
                  @respati_stream
                </div>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1.5 text-zinc-500 hover:text-zinc-900 rounded-lg hover:bg-zinc-100"
              aria-label="Close menu"
            >
              <RiCloseLine className="text-lg" />
            </button>
          </div>

          {/* Quick Hardware Telemetry LED Strip */}
          <div className="mt-3.5 flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-[11px] font-mono">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full transition-colors ${
                  isSocketConnected
                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                    : 'bg-amber-500 animate-pulse'
                }`}
              />
              <span className="font-semibold text-zinc-700">WS HUB</span>
            </div>
            <span
              className={`font-bold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded ${
                isSocketConnected
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                  : 'bg-amber-50 text-amber-700 border border-amber-200/80'
              }`}
            >
              {isSocketConnected ? 'CONNECTED' : 'CONNECTING'}
            </span>
          </div>
        </div>

        {/* Navigation Menu Links */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">
            Control Station
          </div>

          {navLinks.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);

            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? 'bg-zinc-950 text-white shadow-tactile'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`text-lg shrink-0 ${isActive ? 'text-white' : 'text-zinc-500'}`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded tracking-wide ${
                      isActive
                        ? 'bg-rose-500 text-white'
                        : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          <div className="pt-4 px-3 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">
            OBS Studio Output
          </div>

          {/* Dedicated Link to OBS Transparent Overlay */}
          <Link
            to="/overlay"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-zinc-800 bg-white hover:bg-zinc-50 rounded-lg border border-zinc-200/90 shadow-sm transition-all group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <RiTvLine className="text-base text-zinc-700 group-hover:text-zinc-950" />
              <span>OBS Overlay (1080p)</span>
            </div>
            <RiExternalLinkLine
              className="text-sm text-zinc-400 group-hover:text-zinc-800 group-hover:translate-x-0.5 transition-transform"
            />
          </Link>
        </nav>
      </div>

      {/* Sidebar Footer / Hardware Status */}
      <div className="p-3.5 border-t border-zinc-200 bg-zinc-50/70 text-[11px] font-mono text-zinc-500 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-semibold text-zinc-400">WS Hub</span>
          <span className="font-bold text-zinc-800 font-mono">
            {isSocketConnected ? 'Connected (Port 4000)' : 'Connecting...'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-semibold text-zinc-400">Station</span>
          <span className="text-zinc-700 font-mono font-medium">v1.2.0 • Studio Pro</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-[#fafafa] text-zinc-900 font-sans antialiased">
      {/* ─── MOBILE TOP HEADER (< md) ────────────────────────────────────────── */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between p-3.5 bg-white/95 backdrop-blur-md border-b border-zinc-200 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center text-white shadow-sm">
            <RiBroadcastFill className="text-rose-500 animate-pulse text-base" />
          </div>
          <div>
            <div className="text-xs font-bold font-mono uppercase text-zinc-950">Stream Hub Pro</div>
            <div className="text-[10px] font-mono text-zinc-500">@respati_stream</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-100"
            aria-label="Open Navigation Menu"
          >
            <RiMenuLine className="text-lg" />
          </button>
        </div>
      </div>

      {/* ─── MOBILE DRAWER OVERLAY (< md) ────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative w-72 max-w-[80vw] bg-white border-r border-zinc-200 z-10 shadow-2xl flex flex-col h-full">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* ─── DESKTOP TACTILE BROADCAST SIDEBAR (>= md) ─────────────────────────── */}
      <aside className="hidden md:flex w-64 h-[100dvh] sticky top-0 bg-white border-r border-zinc-200 flex-col shrink-0 select-none overflow-y-auto z-40">
        {sidebarContent}
      </aside>

      {/* ─── MAIN CONTENT AREA ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-[100dvh]">
        <Suspense
          fallback={
            <div className="flex flex-1 w-full items-center justify-center min-h-[60vh]">
              <LoadingSpinner size="md" label="Loading view..." />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}
