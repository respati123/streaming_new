import { useThemeStore } from '@shared/stores/theme.store';
import { RiMoonFill, RiSunFill } from 'react-icons/ri';

export function ThemeToggle() {
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 transition-all hover:bg-zinc-50 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 shadow-xs active:scale-95 font-sans"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <RiSunFill className="text-base text-amber-500 transition-transform duration-200" />
      ) : (
        <RiMoonFill className="text-base text-zinc-700 transition-transform duration-200" />
      )}
    </button>
  );
}
