import { Button } from '@shared/components/ui/Button';
import { Heading, Text } from '@shared/components/ui/Typography';
import { useDocumentTitle } from '@shared/hooks/useDocumentTitle';
import { useTranslation } from '@shared/hooks/useTranslation';
import {
  RiArrowLeftLine,
  RiCompass3Line,
  RiHome4Line,
} from 'react-icons/ri';
import { Link, useNavigate } from 'react-router-dom';
import type { NotFoundPageProps } from '../types/app.types';

export default function NotFoundPage({ onBackHome }: NotFoundPageProps) {
  const { t } = useTranslation();
  useDocumentTitle('Page Not Found');
  const navigate = useNavigate();

  const handleBackHome = (): void => {
    if (onBackHome) {
      onBackHome();
    } else {
      navigate('/admin');
    }
  };

  return (
    <div
      data-testid="not-found-container"
      className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 font-sans animate-fadeIn"
    >
      <div className="rounded-3xl bg-zinc-100 p-6 text-zinc-800 mb-6 border border-zinc-200 shadow-sm animate-scaleUp">
        <RiCompass3Line className="text-5xl" />
      </div>

      <span
        data-testid="not-found-badge"
        className="rounded-lg bg-zinc-100 px-3.5 py-1 text-xs font-mono font-bold text-zinc-800 uppercase tracking-widest border border-zinc-200"
      >
        {t('notFound.badge')}
      </span>

      <Heading
        data-testid="not-found-title"
        level="h1"
        variant="display"
        className="mt-4 text-3xl sm:text-4xl"
      >
        {t('notFound.title')}
      </Heading>

      <Text
        data-testid="not-found-desc"
        variant="body"
        color="muted"
        className="mt-2 max-w-md mx-auto"
      >
        {t('notFound.subtitle')}
      </Text>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          data-testid="not-found-back-btn"
          variant="outline"
          size="md"
          onClick={() => navigate(-1)}
          leftIcon={<RiArrowLeftLine className="text-base" />}
        >
          Go Back
        </Button>

        <Button
          data-testid="not-found-home-btn"
          variant="primary"
          size="md"
          onClick={handleBackHome}
          leftIcon={<RiHome4Line className="text-base" />}
        >
          <Link to="/admin" className="text-white">
            {t('notFound.backHome')}
          </Link>
        </Button>
      </div>
    </div>
  );
}
