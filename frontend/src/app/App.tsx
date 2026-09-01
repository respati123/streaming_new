import { ErrorBoundary } from '@shared/components/ui/ErrorBoundary';
import { AppProviders } from './providers/AppProviders';
import { AppRoutes } from './routes/AppRoutes';

export function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </ErrorBoundary>
  );
}

export default App;
