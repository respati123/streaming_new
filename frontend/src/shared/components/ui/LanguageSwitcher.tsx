import { useTranslation } from '@shared/hooks/useTranslation';
import { RiGlobalLine } from 'react-icons/ri';

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();

  return (
    <div
      data-testid="language-switcher"
      className="flex items-center rounded-xl border border-zinc-200 bg-zinc-50 p-0.5 text-xs font-mono font-bold shadow-xs"
    >
      <div className="flex items-center pl-2 pr-1 text-zinc-400">
        <RiGlobalLine className="text-sm" />
      </div>
      <button
        type="button"
        data-testid="lang-btn-en"
        onClick={() => setLanguage('en')}
        className={`rounded-lg px-2.5 py-1 transition-all ${
          language === 'en'
            ? 'bg-zinc-950 font-bold text-white shadow-xs'
            : 'text-zinc-500 hover:text-zinc-950'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        data-testid="lang-btn-id"
        onClick={() => setLanguage('id')}
        className={`rounded-lg px-2.5 py-1 transition-all ${
          language === 'id'
            ? 'bg-zinc-950 font-bold text-white shadow-xs'
            : 'text-zinc-500 hover:text-zinc-950'
        }`}
      >
        ID
      </button>
    </div>
  );
}
