/**
 * AkLoader Linear Component
 * Custom linear loader component matching Ember ak-loader/linear implementation exactly
 * Reference: app/components/ak-loader/linear/
 */

import { type ReactNode, type HTMLAttributes } from 'react';
import { cva } from 'class-variance-authority';
import { AkStack } from '@components/ak-stack';
import type { AkLoaderColor } from './index';
import './Linear.scss';

const linearIndicatorVariants = cva('ak-loader-linear-indicator', {
  variants: {
    color: {
      primary: 'ak-loader-linear-color-primary',
      secondary: 'ak-loader-linear-color-secondary',
      success: 'ak-loader-linear-color-success',
      error: 'ak-loader-linear-color-error',
      warn: 'ak-loader-linear-color-warn',
      'warn-dark': 'ak-loader-linear-color-warn-dark',
      info: 'ak-loader-linear-color-info',
      'info-dark': 'ak-loader-linear-color-info-dark',
    },
    variant: {
      determinate: '',
      indeterminate: 'indeterminate-indicator-bar--1',
    },
  },
  defaultVariants: {
    color: 'primary',
    variant: 'indeterminate',
  },
});

interface AkLoaderLinearProps extends HTMLAttributes<HTMLDivElement> {
  /** Height in pixels */
  height?: number;
  /** Progress value (0-100) for determinate variant */
  progress?: number;
  /** Loader variant */
  variant?: 'determinate' | 'indeterminate';
  /** Loader color */
  color?: AkLoaderColor;
  /** Label content */
  label?: ReactNode;
  /** Children */
  children?: ReactNode;
}

export function AkLoaderLinear({
  height = 5,
  progress = 0,
  variant = 'indeterminate',
  color = 'primary',
  label,
  children,
  className,
  ...props
}: AkLoaderLinearProps) {
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  const isIndeterminate = variant === 'indeterminate';

  const progressStyle = {
    transform: `translateX(${normalizedProgress}%)`,
  };

  const indicatorClassName = linearIndicatorVariants({ color, variant });

  return (
    <AkStack
      alignItems="center"
      spacing={1.5}
      width="full"
      className={className}
      data-test-ak-loader-linear
      data-test-ak-loader-linear-progress={progress}
      {...props}
    >
      <span
        className="ak-loader-linear-root"
        style={{ height: `${height}px` }}
      >
        <span
          className={indicatorClassName}
          style={!isIndeterminate ? progressStyle : undefined}
          data-test-ak-loader-linear-indicator
        />

        {isIndeterminate && (
          <span
            className="indeterminate-indicator-bar--2"
            data-test-ak-loader-linear-indicator
          />
        )}
      </span>

      {(label || children) && (
        <span className="ak-loader-linear-label">{label || children}</span>
      )}
    </AkStack>
  );
}
