/**
 * AkLink Component
 * Custom link component matching Ember ak-link implementation exactly
 * Reference: app/components/ak-link/
 */

import { type ReactNode, type AnchorHTMLAttributes } from 'react';
import { cva } from 'class-variance-authority';
import {
  AkTypography,
  type TypographyVariant,
  type TypographyFontWeight,
  type TypographyColors,
} from '@components/ak-typography';
import './index.scss';

export type AkLinkColors =
  | 'textPrimary'
  | 'textSecondary'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'warn'
  | 'info'
  | 'inherit';

const linkVariants = cva('ak-link-root', {
  variants: {
    color: {
      textPrimary: 'ak-link-color-textPrimary',
      textSecondary: 'ak-link-color-textSecondary',
      primary: 'ak-link-color-primary',
      secondary: 'ak-link-color-secondary',
      success: 'ak-link-color-success',
      error: 'ak-link-color-error',
      warn: 'ak-link-color-warn',
      info: 'ak-link-color-info',
      inherit: 'ak-link-color-inherit',
    },
    underline: {
      none: 'ak-link-underline-none',
      always: 'ak-link-underline-always',
      hover: 'ak-link-underline-hover',
    },
    disabled: {
      true: 'ak-link-disabled',
      false: '',
    },
    noWrap: {
      true: 'ak-link-noWrap',
      false: '',
    },
  },
  defaultVariants: {
    color: 'textPrimary',
    underline: 'hover',
    disabled: false,
    noWrap: false,
  },
});

interface BaseLinkProps {
  /** Link color */
  color?: AkLinkColors;
  /** Underline behavior */
  underline?: 'none' | 'always' | 'hover';
  /** Disabled state */
  disabled?: boolean;
  /** Typography variant */
  typographyVariant?: TypographyVariant;
  /** Typography font weight */
  fontWeight?: TypographyFontWeight;
  /** No wrap text */
  noWrap?: boolean;
  /** Left icon element */
  leftIcon?: ReactNode;
  /** Right icon element */
  rightIcon?: ReactNode;
  /** CSS class for link text */
  linkTextClass?: string;
  /** Children */
  children?: ReactNode;
}

export type AkLinkProps = BaseLinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseLinkProps>;

export function AkLink({
  color = 'textPrimary',
  underline = 'hover',
  disabled = false,
  typographyVariant,
  fontWeight,
  noWrap = false,
  leftIcon,
  rightIcon,
  linkTextClass,
  children,
  className,
  onClick,
  ...props
}: AkLinkProps) {
  const linkClassName = linkVariants({
    color,
    underline,
    disabled,
    noWrap,
    className,
  });

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <a
      data-test-ak-link
      className={linkClassName}
      onClick={handleClick}
      aria-disabled={disabled}
      {...props}
    >
      {leftIcon && (
        <div data-test-ak-link-left-icon className="ak-link-left-icon">
          {leftIcon}
        </div>
      )}

      <AkTypography
        data-test-ak-link-text
        variant={typographyVariant}
        color={disabled ? 'inherit' : (color as TypographyColors)}
        noWrap={noWrap}
        tag="span"
        fontWeight={fontWeight}
        className={`ak-link-text ${linkTextClass || ''}`}
      >
        {children}
      </AkTypography>

      {rightIcon && (
        <div data-test-ak-link-right-icon className="ak-link-right-icon">
          {rightIcon}
        </div>
      )}
    </a>
  );
}
