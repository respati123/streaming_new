import { cn } from '@core/utils/cn';
import React, { forwardRef } from 'react';
import type {
  CodeProps,
  FontWeight,
  HeadingProps,
  HeadingVariant,
  KbdProps,
  TextColor,
  TextProps,
  TextVariant,
} from '@shared/types/typography.types';

const colorStyles: Record<TextColor, string> = {
  default: 'text-zinc-950',
  muted: 'text-zinc-600',
  subtle: 'text-zinc-400',
  primary: 'text-zinc-900',
  success: 'text-emerald-700',
  warning: 'text-amber-700',
  danger: 'text-rose-600',
  white: 'text-white',
};

const weightStyles: Record<FontWeight, string> = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
  black: 'font-black',
};

const headingVariantStyles: Record<HeadingVariant, string> = {
  display: 'text-2xl sm:text-3xl font-extrabold tracking-tight font-sans',
  'title-lg': 'text-xl sm:text-2xl font-extrabold tracking-tight font-sans',
  'title-md': 'text-lg sm:text-xl font-bold tracking-tight font-sans',
  'title-sm': 'text-base font-bold font-sans',
  section: 'text-xs font-bold uppercase font-mono tracking-wider',
  card: 'text-xs sm:text-sm font-bold font-sans tracking-tight',
};

const textVariantStyles: Record<TextVariant, string> = {
  lead: 'text-base sm:text-lg leading-relaxed font-sans',
  body: 'text-xs sm:text-sm leading-normal font-sans',
  'body-sm': 'text-xs leading-relaxed font-sans',
  caption: 'text-[11px] sm:text-xs leading-tight font-sans',
  meta: 'text-[11px] font-mono leading-none',
  mono: 'text-xs sm:text-sm font-mono leading-relaxed',
  'mono-sm': 'text-[10px] sm:text-[11px] font-mono font-bold tracking-tight',
  stat: 'text-xl sm:text-2xl font-black font-mono tracking-tight',
};

/**
 * Polymorphic Heading Component
 * Handles h1-h6 semantic tags while allowing design system visual variants.
 */
export const Heading = forwardRef(
  <E extends React.ElementType = 'h1'>(
    {
      as,
      level = 'h1',
      variant,
      color = 'default',
      weight,
      truncate = false,
      className,
      children,
      ...props
    }: HeadingProps<E>,
    ref: React.Ref<any>
  ) => {
    // Default semantic element based on level or variant
    const Component = as || level || 'h1';
    const computedVariant: HeadingVariant = variant || (level === 'h1' ? 'title-lg' : level === 'h2' ? 'title-md' : 'title-sm');

    return (
      <Component
        ref={ref}
        className={cn(
          headingVariantStyles[computedVariant],
          colorStyles[color],
          weight && weightStyles[weight],
          truncate && 'truncate',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
) as <E extends React.ElementType = 'h1'>(
  props: HeadingProps<E> & { ref?: React.Ref<any> }
) => React.ReactElement;

/**
 * Polymorphic Text Component
 * Provides unified font hierarchy and token styling across all views.
 */
export const Text = forwardRef(
  <E extends React.ElementType = 'p'>(
    {
      as,
      variant = 'body',
      color,
      weight,
      truncate = false,
      className,
      children,
      ...props
    }: TextProps<E>,
    ref: React.Ref<any>
  ) => {
    const Component = as || (variant === 'meta' || variant === 'mono-sm' ? 'span' : 'p');
    // Default color strategy based on variant
    const resolvedColor: TextColor =
      color || (variant === 'meta' ? 'subtle' : variant === 'lead' ? 'muted' : 'default');

    return (
      <Component
        ref={ref}
        className={cn(
          textVariantStyles[variant],
          colorStyles[resolvedColor],
          weight && weightStyles[weight],
          truncate && 'truncate',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
) as <E extends React.ElementType = 'p'>(
  props: TextProps<E> & { ref?: React.Ref<any> }
) => React.ReactElement;

/**
 * Monospace Code Component for tokens, IDs, and endpoints
 */
export const Code = forwardRef<HTMLElement, CodeProps>(
  ({ variant = 'inline', className, children, ...props }, ref) => {
    if (variant === 'block') {
      return (
        <pre
          ref={ref as React.Ref<HTMLPreElement>}
          className={cn(
            'p-3.5 bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed',
            className
          )}
          {...(props as any)}
        >
          <code>{children}</code>
        </pre>
      );
    }

    return (
      <code
        ref={ref}
        className={cn(
          'font-mono text-xs',
          variant === 'pill'
            ? 'px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-800 font-bold'
            : 'px-1.5 py-0.5 rounded bg-zinc-100/80 text-zinc-800 border border-zinc-200/60 text-[11px]',
          className
        )}
        {...props}
      >
        {children}
      </code>
    );
  }
);
Code.displayName = 'Code';

/**
 * Keyboard / Deck Key Shortcut Component
 */
export const Kbd = forwardRef<HTMLElement, KbdProps>(
  ({ size = 'md', className, children, ...props }, ref) => {
    return (
      <kbd
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-mono font-bold rounded bg-zinc-100 text-zinc-800 border border-zinc-300 border-b-2 border-b-zinc-400 shadow-xs select-none',
          size === 'sm' ? 'px-1.5 py-0.2 text-[10px] min-w-[18px]' : 'px-2 py-0.5 text-xs min-w-[22px]',
          className
        )}
        {...props}
      >
        {children}
      </kbd>
    );
  }
);
Kbd.displayName = 'Kbd';

/**
 * Unified Typography Export
 */
export const Typography = {
  Heading,
  Text,
  Code,
  Kbd,
};
