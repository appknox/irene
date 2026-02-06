/**
 * AkLoader Component
 * Custom loader component matching Ember ak-loader implementation exactly
 * Reference: app/components/ak-loader/
 */

import { type ReactNode, type HTMLAttributes } from 'react';
import { cva } from 'class-variance-authority';
import './index.scss';

export type AkLoaderColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'warn'
  | 'warn-dark'
  | 'info'
  | 'info-dark';

const loaderVariants = cva('ak-loader-svg', {
  variants: {
    variant: {
      determinate: '',
      indeterminate: 'indeterminate',
    },
  },
  defaultVariants: {
    variant: 'indeterminate',
  },
});

const loaderTrackVariants = cva('ak-loader-svg-track', {
  variants: {
    color: {
      primary: 'ak-loader-track-color-primary',
      secondary: 'ak-loader-track-color-secondary',
      success: 'ak-loader-track-color-success',
      error: 'ak-loader-track-color-error',
      warn: 'ak-loader-track-color-warn',
      'warn-dark': 'ak-loader-track-color-warn-dark',
      info: 'ak-loader-track-color-info',
      'info-dark': 'ak-loader-track-color-info-dark',
    },
  },
  defaultVariants: {
    color: 'primary',
  },
});

const loaderIndicatorVariants = cva('ak-loader-svg-indicator', {
  variants: {
    color: {
      primary: 'ak-loader-indicator-color-primary',
      secondary: 'ak-loader-indicator-color-secondary',
      success: 'ak-loader-indicator-color-success',
      error: 'ak-loader-indicator-color-error',
      warn: 'ak-loader-indicator-color-warn',
      'warn-dark': 'ak-loader-indicator-color-warn-dark',
      info: 'ak-loader-indicator-color-info',
      'info-dark': 'ak-loader-indicator-color-info-dark',
    },
    variant: {
      determinate: '',
      indeterminate: 'indeterminate',
    },
  },
  defaultVariants: {
    color: 'primary',
    variant: 'indeterminate',
  },
});

interface AkLoaderProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
  /** Loader size in pixels */
  size?: number;
  /** Stroke thickness */
  thickness?: number;
  /** Progress value (0-100) for determinate variant */
  progress?: number;
  /** Loader variant */
  variant?: 'determinate' | 'indeterminate';
  /** Loader color */
  color?: AkLoaderColor;
  /** Label content (rendered in center) */
  label?: ReactNode;
  /** Children */
  children?: ReactNode;
}

export { AkLoaderLinear } from './Linear';

export function AkLoader({
  size = 40,
  thickness = 4,
  progress = 0,
  variant = 'indeterminate',
  color = 'primary',
  label,
  children,
  className,
  ...props
}: AkLoaderProps) {
  const viewPortSize = 44;
  const radius = (viewPortSize - thickness) / 2;
  const dashArray = 2 * Math.PI * radius;

  const normalizedProgress = Math.min(100, Math.max(0, progress));
  const dashOffset =
    variant === 'determinate'
      ? dashArray * ((100 - normalizedProgress) / 100)
      : dashArray;

  const viewBox = `${viewPortSize / 2} ${viewPortSize / 2} ${viewPortSize} ${viewPortSize}`;

  const svgClassName = loaderVariants({ variant });
  const trackClassName = loaderTrackVariants({ color });
  const indicatorClassName = loaderIndicatorVariants({ color, variant });

  return (
    <span
      className={`ak-loader-root ${className || ''}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      role="progressbar"
      data-test-ak-loader
      data-test-ak-loader-progress={progress}
      {...props}
    >
      {(label || children) && (
        <span className="ak-loader-svg-label">{label || children}</span>
      )}

      <svg
        className={svgClassName}
        role="presentation"
        viewBox={viewBox}
        data-test-ak-loader-svg
      >
        <g role="presentation">
          <circle
            data-test-ak-loader-svg-track
            className={trackClassName}
            role="presentation"
            cx={viewPortSize}
            cy={viewPortSize}
            r={radius}
            fill="none"
            strokeWidth={thickness}
          />

          <circle
            data-test-ak-loader-svg-indicator
            className={`${indicatorClassName} ak-loader-circle-indicator`}
            role="presentation"
            cx={viewPortSize}
            cy={viewPortSize}
            r={radius}
            strokeWidth={thickness}
            strokeDasharray={dashArray}
            strokeDashoffset={dashOffset}
            data-test-ak-loader-circle-indicator
          />
        </g>
      </svg>
    </span>
  );
}
