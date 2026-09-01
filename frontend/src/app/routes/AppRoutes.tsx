import { AdminLayout } from '@shared/components/layout/AdminLayout';
import { LoadingSpinner } from '@shared/components/ui/LoadingSpinner';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const DashboardPage = lazy(() => import('@features/dashboard/views/DashboardPage'));
const UsersDirectoryPage = lazy(() => import('@features/dashboard/views/UsersDirectoryPage'));
const StreamsHistoryPage = lazy(() => import('@features/dashboard/views/StreamsHistoryPage'));
const StreamerbotPage = lazy(() => import('@features/dashboard/views/StreamerbotPage'));
const OverlayStudioPage = lazy(() => import('@features/dashboard/views/OverlayStudioPage'));
const OverlayPage = lazy(() => import('@features/dashboard/views/OverlayPage'));
const NotFoundPage = lazy(() => import('../views/NotFoundPage'));

export function AppRoutes() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100dvh] w-full items-center justify-center bg-[#fafafa]">
          <LoadingSpinner size="lg" label="Loading Broadcast Deck..." />
        </div>
      }
    >
      <Routes>
        {/* Admin Dashboard with Tactile Broadcast Sidebar */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UsersDirectoryPage />} />
          <Route path="streams" element={<StreamsHistoryPage />} />
          <Route path="overlay-studio" element={<OverlayStudioPage />} />
          <Route path="streamerbot" element={<StreamerbotPage />} />
        </Route>

        {/* OBS 1080p Transparent Browser Source Overlay (Standalone) */}
        <Route path="/overlay" element={<OverlayPage />} />

        {/* Root Redirect to /admin */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
