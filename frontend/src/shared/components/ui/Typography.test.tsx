import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Code, Heading, Kbd, Text, Typography } from './Typography';

describe('Typography Components Unit Tests', () => {
  describe('Heading Component', () => {
    it('renders default h1 with title-lg variant', () => {
      render(<Heading>Main Heading</Heading>);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Main Heading');
      expect(heading.className).toContain('font-extrabold');
    });

    it('renders different levels and variants', () => {
      render(
        <Heading level="h3" variant="section">
          Section Title
        </Heading>
      );
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
      expect(heading.className).toContain('font-mono');
    });

    it('supports polymorphic "as" prop', () => {
      render(
        <Heading as="div" data-testid="custom-heading">
          Div Heading
        </Heading>
      );
      const el = screen.getByTestId('custom-heading');
      expect(el.tagName.toLowerCase()).toBe('div');
    });
  });

  describe('Text Component', () => {
    it('renders default paragraph body text', () => {
      render(<Text>This is standard body text</Text>);
      const p = screen.getByText('This is standard body text');
      expect(p.tagName.toLowerCase()).toBe('p');
      expect(p.className).toContain('font-sans');
    });

    it('renders meta variant with monospace styling', () => {
      render(<Text variant="meta">2026-08-31 14:00</Text>);
      const meta = screen.getByText('2026-08-31 14:00');
      expect(meta.className).toContain('font-mono');
    });

    it('supports custom colors and weights', () => {
      render(
        <Text color="success" weight="bold">
          Active Status
        </Text>
      );
      const text = screen.getByText('Active Status');
      expect(text.className).toContain('text-emerald-700');
      expect(text.className).toContain('font-bold');
    });
  });

  describe('Code and Kbd Components', () => {
    it('renders inline code and pill code', () => {
      render(<Code variant="pill">ID-12345</Code>);
      const code = screen.getByText('ID-12345');
      expect(code.tagName.toLowerCase()).toBe('code');
      expect(code.className).toContain('font-mono');
      expect(code.className).toContain('rounded-md');
    });

    it('renders keyboard shortcut Kbd', () => {
      render(<Kbd>Ctrl + K</Kbd>);
      const kbd = screen.getByText('Ctrl + K');
      expect(kbd.tagName.toLowerCase()).toBe('kbd');
      expect(kbd.className).toContain('font-mono');
    });

    it('exports all subcomponents on Typography namespace', () => {
      expect(Typography.Heading).toBeDefined();
      expect(Typography.Text).toBeDefined();
      expect(Typography.Code).toBeDefined();
      expect(Typography.Kbd).toBeDefined();
    });
  });
});
