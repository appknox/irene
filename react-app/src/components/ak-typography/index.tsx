/**
 * AkTypography Component
 * Custom typography component matching Ember ak-typography implementation exactly
 * Reference: app/components/ak-typography/
 */

import { type ReactNode, type HTMLAttributes, type ElementType } from 'react';

import { cva } from 'class-variance-authority';
import './index.scss';

const variantMapping = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  subtitle1: 'h6',
  subtitle2: 'h6',
  body1: 'p',
  body2: 'p',
  body3: 'p',
} as const;

export type TypographyVariant = keyof typeof variantMapping;
export type TypographyColors =
  | 'inherit'
  | 'textPrimary'
  | 'textSecondary'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'info'
  | 'warn'
  | 'neutral';

export type TypographyFontWeight = 'medium' | 'light' | 'bold' | 'regular';

const typographyVariants = cva('ak-typography', {
  variants: {
    variant: {
      h1: 'ak-typography-h1',
      h2: 'ak-typography-h2',
      h3: 'ak-typography-h3',
      h4: 'ak-typography-h4',
      h5: 'ak-typography-h5',
      h6: 'ak-typography-h6',
      subtitle1: 'ak-typography-subtitle1',
      subtitle2: 'ak-typography-subtitle2',
      body1: 'ak-typography-body1',
      body2: 'ak-typography-body2',
      body3: 'ak-typography-body3',
    },
    color: {
      inherit: 'ak-typography-color-inherit',
      textPrimary: 'ak-typography-color-textPrimary',
      textSecondary: 'ak-typography-color-textSecondary',
      primary: 'ak-typography-color-primary',
      secondary: 'ak-typography-color-secondary',
      success: 'ak-typography-color-success',
      error: 'ak-typography-color-error',
      info: 'ak-typography-color-info',
      warn: 'ak-typography-color-warn',
      neutral: 'ak-typography-color-neutral',
    },
    gutterBottom: {
      true: 'ak-typography-gutter-bottom',
      false: 'ak-typography-no-gutter-bottom',
    },
    align: {
      inherit: 'ak-typography-align-inherit',
      left: 'ak-typography-align-left',
      center: 'ak-typography-align-center',
      right: 'ak-typography-align-right',
      justify: 'ak-typography-align-justify',
    },
    underline: {
      none: 'ak-typography-underline-none',
      always: 'ak-typography-underline-always',
      hover: 'ak-typography-underline-hover',
    },
    fontWeight: {
      light: 'ak-typography-font-weight-light',
      regular: 'ak-typography-font-weight-regular',
      medium: 'ak-typography-font-weight-medium',
      bold: 'ak-typography-font-weight-bold',
    },
    noWrap: {
      true: 'no-wrap',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'body1',
    color: 'textPrimary',
    gutterBottom: false,
    align: 'inherit',
    underline: 'none',
    noWrap: false,
  },
});

interface AkTypographyProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  /** Component tag to render */
  tag?: keyof HTMLElementTagNameMap;
  /** Typography variant */
  variant?: TypographyVariant;
  /** Text color */
  color?: TypographyColors;
  /** Font weight */
  fontWeight?: TypographyFontWeight;
  /** Add bottom margin */
  gutterBottom?: boolean;
  /** Text alignment */
  align?: 'inherit' | 'left' | 'right' | 'center' | 'justify';
  /** Truncate text */
  noWrap?: boolean;
  /** Underline behavior */
  underline?: 'none' | 'always' | 'hover';
  /** Children */
  children?: ReactNode;
}

export function AkTypography({
  tag,
  variant = 'body1',
  color = 'textPrimary',
  fontWeight,
  gutterBottom = false,
  align = 'inherit',
  noWrap = false,
  underline = 'none',
  children,
  className,
  ...props
}: AkTypographyProps) {
  const Tag = (tag || variantMapping[variant]) as ElementType;

  const typographyClassName = typographyVariants({
    variant,
    color,
    gutterBottom,
    align,
    underline,
    fontWeight,
    noWrap,
    className,
  });

  return (
    <Tag data-test-ak-typography className={typographyClassName} {...props}>
      {children}
    </Tag>
  );
}
