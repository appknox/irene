/**
 * AkDivider Component
 * Custom divider component matching Ember ak-divider implementation exactly
 * Reference: app/components/ak-divider/
 */

import { type HTMLAttributes, type ElementType } from 'react';
import { cva } from 'class-variance-authority';
import './index.scss';

const dividerVariants = cva('ak-divider-root', {
  variants: {
    variant: {
      fullWidth: 'ak-divider-variant-fullWidth',
      middle: 'ak-divider-variant-middle',
    },
    color: {
      light: 'ak-divider-color-light',
      dark: 'ak-divider-color-dark',
    },
    direction: {
      horizontal: 'ak-divider-direction-horizontal',
      vertical: 'ak-divider-direction-vertical',
    },
  },
  defaultVariants: {
    variant: 'fullWidth',
    color: 'light',
    direction: 'horizontal',
  },
});

interface AkDividerProps extends HTMLAttributes<HTMLElement> {
  /** HTML tag to render */
  tag?: string;
  /** Divider variant */
  variant?: 'fullWidth' | 'middle';
  /** Divider color */
  color?: 'light' | 'dark';
  /** Direction */
  direction?: 'horizontal' | 'vertical';
  /** Height (vertical dividers) */
  height?: string;
  /** Width (horizontal dividers) */
  width?: string;
}

export function AkDivider({
  tag,
  variant = 'fullWidth',
  color = 'light',
  direction = 'horizontal',
  height,
  width,
  className,
  style,
  ...props
}: AkDividerProps) {
  const isVertical = direction === 'vertical';

  // Determine default tag based on direction
  const defaultTag = isVertical ? 'div' : 'hr';
  const Tag = (tag || defaultTag) as ElementType;

  // Calculate dimensions
  const computedHeight = isVertical ? height || '100%' : '1px';
  const computedWidth = !isVertical ? width || '100%' : '1px';

  const dividerClassName = dividerVariants({
    variant,
    color,
    direction,
    className,
  });

  const dividerStyle = {
    ...style,
    width: computedWidth,
    height: computedHeight,
  };

  return (
    <Tag
      data-test-ak-divider
      className={dividerClassName}
      style={dividerStyle}
      {...props}
    />
  );
}
