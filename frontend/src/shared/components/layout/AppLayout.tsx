import { OfflineBanner } from '@shared/components/ui/OfflineBanner';
import { ToastContainer } from '@shared/components/ui/ToastContainer';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function AppLayout() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#fafafa] text-zinc-900 font-sans transition-colors duration-200">
      <OfflineBanner />
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-zinc-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-xs font-mono text-zinc-500">
          Respati Stream Hub Pro • Real-time Broadcast Control & Engagement Platform
        </div>
      </footer>
      <ToastContainer />
    </div>
  );
}
