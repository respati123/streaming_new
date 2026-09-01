import { APP_CONFIG } from '@core/constants/app.constant';
import { useEffect } from 'react';

/**
 * Dynamically updates document title with application branding and restores previous title on unmount.
 */
export function useDocumentTitle(title: string, restoreOnUnmount: boolean = true) {
  useEffect(() => {
    const previousTitle = document.title;
    const formattedTitle = title ? `${title} | ${APP_CONFIG.NAME}` : APP_CONFIG.NAME;
    document.title = formattedTitle;

    return () => {
      if (restoreOnUnmount) {
        document.title = previousTitle;
      }
    };
  }, [title, restoreOnUnmount]);
}
