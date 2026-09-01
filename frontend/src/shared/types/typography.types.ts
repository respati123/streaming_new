import type React from 'react';

export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export type HeadingVariant =
  | 'display'    // 30-36px font-extrabold tracking-tight (Main Dashboard / Splash)
  | 'title-lg'   // 24-28px font-extrabold tracking-tight (Page Titles)
  | 'title-md'   // 20-24px font-bold tracking-tight (Section / Panel Headers)
  | 'title-sm'   // 16-18px font-bold (Card Titles / Subsections)
  | 'section'    // 13-14px font-bold uppercase font-mono tracking-wider (Terminal / Section Banners)
  | 'card';      // 14-16px font-bold (Interactive Cards / Deck Keys)

export type TextVariant =
  | 'lead'       // 16-18px font-normal leading-relaxed
  | 'body'       // 14px font-normal leading-normal (Standard Body)
  | 'body-sm'    // 13px font-normal leading-relaxed (Secondary Descriptions)
  | 'caption'    // 12px font-medium (Sub-labels, Helper Texts)
  | 'meta'       // 11-12px font-mono text-zinc-500 (Timestamps, UUIDs, Telemetry)
  | 'mono'       // 13-14px font-mono (Data Cells, JSON / Config)
  | 'mono-sm'    // 11-12px font-mono font-bold (Key Badges, Stats)
  | 'stat';      // 24-30px font-mono font-black tracking-tight (Metrics / Numbers)

export type TextColor =
  | 'default'    // text-zinc-950
  | 'muted'      // text-zinc-600
  | 'subtle'     // text-zinc-400
  | 'primary'    // text-zinc-900
  | 'success'    // text-emerald-600 / text-emerald-700
  | 'warning'    // text-amber-600 / text-amber-700
  | 'danger'     // text-rose-600 / text-rose-700
  | 'white';     // text-white

export type FontWeight =
  | 'light'
  | 'normal'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'extrabold'
  | 'black';

export interface BaseTypographyProps {
  className?: string;
  children?: React.ReactNode;
  color?: TextColor;
  weight?: FontWeight;
  truncate?: boolean;
}

export type HeadingProps<E extends React.ElementType = 'h1'> = BaseTypographyProps & {
  as?: E;
  level?: HeadingLevel;
  variant?: HeadingVariant;
} & Omit<React.ComponentPropsWithoutRef<E>, keyof BaseTypographyProps | 'as' | 'level' | 'variant'>;

export type TextProps<E extends React.ElementType = 'p'> = BaseTypographyProps & {
  as?: E;
  variant?: TextVariant;
} & Omit<React.ComponentPropsWithoutRef<E>, keyof BaseTypographyProps | 'as' | 'variant'>;

export interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
  children?: React.ReactNode;
  variant?: 'inline' | 'block' | 'pill';
}

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'md';
}
