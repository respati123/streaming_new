import { Button } from '@shared/components/ui/Button';
import { Input } from '@shared/components/ui/Input';
import { useDocumentTitle } from '@shared/hooks/useDocumentTitle';
import {
  RiArrowRightLine,
  RiLockLine,
  RiLoginBoxLine,
  RiMailLine,
  RiSparklingFill,
} from 'react-icons/ri';
import { useLoginViewModel } from '../viewmodels/useLoginViewModel';

export default function LoginPage() {
  useDocumentTitle('Sign In');
  const { state, actions } = useLoginViewModel();

  return (
    <div className="flex min-h-[calc(100dvh-12rem)] items-center justify-center py-8 font-sans">
      <div className="w-full max-w-md space-y-7 rounded-2xl border border-zinc-200/90 bg-white p-8 shadow-diffusion sm:p-10 animate-scaleUp">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-tactile border border-zinc-800">
            <RiLoginBoxLine className="text-2xl" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-zinc-950">
            Station Sign In
          </h1>
          <p className="mt-1 text-xs text-zinc-500 font-mono">
            Access Stream Hub Pro broadcast controls and management
          </p>
        </div>

        {/* Global Error Banner */}
        {state.errorMessage && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 font-mono animate-fadeIn">
            {state.errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={actions.handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="admin@antigravity.dev"
            leftIcon={<RiMailLine className="text-base" />}
            value={state.formValues.email}
            onChange={(e) => actions.handleFieldChange('email', e.target.value)}
            error={state.errors.email}
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            leftIcon={<RiLockLine className="text-base" />}
            value={state.formValues.password}
            onChange={(e) => actions.handleFieldChange('password', e.target.value)}
            error={state.errors.password}
            autoComplete="current-password"
          />

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-zinc-600 cursor-pointer select-none font-medium">
              <input
                type="checkbox"
                checked={state.formValues.rememberMe}
                onChange={(e) => actions.handleFieldChange('rememberMe', e.target.checked)}
                className="rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950 accent-zinc-950"
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              onClick={actions.fillDemoCredentials}
              className="inline-flex items-center gap-1 font-bold text-zinc-950 hover:text-zinc-700 font-mono text-[11px]"
            >
              <RiSparklingFill className="text-amber-500 text-xs" />
              <span>Fill Demo Account</span>
            </button>
          </div>

          <Button
            type="submit"
            size="lg"
            isLoading={state.isSubmitting}
            rightIcon={<RiArrowRightLine className="text-base" />}
            className="w-full mt-2"
          >
            Sign In to Station
          </Button>
        </form>
      </div>
    </div>
  );
}
