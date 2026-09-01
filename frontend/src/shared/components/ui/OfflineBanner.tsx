import { useOnlineStatus } from '@shared/hooks/useOnlineStatus';
import { RiWifiOffLine } from 'react-icons/ri';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 inset-x-0 z-50 flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-xs font-mono font-bold text-zinc-950 shadow-md animate-fadeIn font-sans"
    >
      <RiWifiOffLine className="text-sm shrink-0" />
      <span>
        Broadcast station offline. Real-time SSE telemetry and WebSocket sync are paused.
      </span>
    </div>
  );
}
