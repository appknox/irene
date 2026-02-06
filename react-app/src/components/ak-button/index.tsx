/**
 * AkButton Component
 * Custom button component matching Ember ak-button implementation exactly
 * Reference: app/components/ak-button/
 */

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type AnchorHTMLAttributes,
  type ReactNode,
  type MouseEvent,
  type JSX,
} from 'react';
import { cva } from 'class-variance-authority';
import './index.scss';

type ButtonColors =
  | 'primary'
  | 'secondary'
  | 'textPrimary'
  | 'textSecondary'
  | 'error'
  | 'success'
  | 'warn'
  | 'info'
  | 'neutral';

type ButtonVariants = 'filled' | 'text' | 'outlined';

type ButtonTags = 'button' | 'a' | 'div' | 'label' | 'span';

const buttonVariants = cva('ak-button-root', {
  variants: {
    variant: {
      filled: '',
      outlined: '',
      text: 'ak-button-text-root',
    },
    color: {
      primary: '',
      secondary: '',
      success: '',
      error: '',
      warn: '',
      info: '',
      neutral: '',
      textPrimary: '',
      textSecondary: '',
    },
    state: {
      normal: '',
      disabled: 'ak-button-disabled',
      loading: 'ak-button-loading',
    },
    underline: {
      hover: '',
      none: 'ak-button-text-underline-none',
      always: '',
    },
  },
  compoundVariants: [
    // Filled variant combinations
    {
      variant: 'filled',
      color: 'primary',
      className: 'ak-button-filled-primary',
    },
    {
      variant: 'filled',
      color: 'secondary',
      className: 'ak-button-filled-secondary',
    },
    {
      variant: 'filled',
      color: 'success',
      className: 'ak-button-filled-success',
    },
    {
      variant: 'filled',
      color: 'error',
      className: 'ak-button-filled-error',
    },
    {
      variant: 'filled',
      color: 'warn',
      className: 'ak-button-filled-warn',
    },
    {
      variant: 'filled',
      color: 'info',
      className: 'ak-button-filled-info',
    },
    // Outlined variant combinations
    {
      variant: 'outlined',
      color: 'primary',
      className: 'ak-button-outlined-primary',
    },
    {
      variant: 'outlined',
      color: 'secondary',
      className: 'ak-button-outlined-secondary',
    },
    {
      variant: 'outlined',
      color: 'success',
      className: 'ak-button-outlined-success',
    },
    {
      variant: 'outlined',
      color: 'error',
      className: 'ak-button-outlined-error',
    },
    {
      variant: 'outlined',
      color: 'neutral',
      className: 'ak-button-outlined-neutral',
    },
  ],
  defaultVariants: {
    variant: 'filled',
    color: 'primary',
    state: 'normal',
    underline: 'hover',
  },
});

interface BaseAkButtonProps {
  /** Component tag to render */
  tag?: ButtonTags;
  /** Button variant */
  variant?: ButtonVariants;
  /** Button color */
  color?: ButtonColors;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state (only for filled variant) */
  loading?: boolean;
  /** Underline behavior for text variant */
  underline?: 'none' | 'always' | 'hover';
  /** Button type (only for button tag) */
  type?: 'button' | 'reset' | 'submit';
  /** Left icon element */
  leftIcon?: ReactNode;
  /** Right icon element */
  rightIcon?: ReactNode;
  /** CSS class for left icon wrapper */
  leftIconClass?: string;
  /** CSS class for right icon wrapper */
  rightIconClass?: string;
  /** Children */
  children?: ReactNode;
  /** Click handler */
  onClick?: (event: MouseEvent) => void;
  /** Additional CSS class */
  className?: string;
}

export type AkButtonProps = BaseAkButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseAkButtonProps> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseAkButtonProps>;

export const AkButton = forwardRef<HTMLButtonElement, AkButtonProps>(
  (
    {
      tag = 'button',
      variant = 'filled',
      color = 'primary',
      disabled = false,
      loading = false,
      underline = 'hover',
      type = 'button',
      leftIcon,
      rightIcon,
      leftIconClass,
      rightIconClass,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const Tag = tag as keyof JSX.IntrinsicElements;
    const isButton = tag === 'button';
    const isTextVariant = variant === 'text';
    const isDisabled = loading || disabled;
    const showLoading = variant === 'filled' && loading;

    // Build class names using CVA
    const buttonClassName = buttonVariants({
      variant,
      color,
      state: showLoading ? 'loading' : isDisabled ? 'disabled' : 'normal',
      underline: isTextVariant ? underline : undefined,
      className,
    });

    const buttonProps = {
      'data-test-ak-button': '',
      className: buttonClassName,
      role: !isButton ? 'button' : undefined,
      ...(isButton && { type, disabled: isDisabled, ref }),
      ...props,
    };

    return (
      <Tag {...(buttonProps as Record<string, unknown>)}>
        {showLoading && (
          <div className="ak-button-loader" data-test-ak-button-loader>
            {/* Loading indicator - to be implemented with AkLoader */}
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              className="ak-loader-circle"
            >
              <circle
                cx="6.5"
                cy="6.5"
                r="5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="31.4"
                strokeDashoffset="0"
                className="ak-loader-circle-indicator"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 6.5 6.5"
                  to="360 6.5 6.5"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          </div>
        )}
        {!showLoading && leftIcon && (
          <div
            className={`ak-button-left-icon ${leftIconClass || ''}`}
            data-test-ak-button-left-icon
          >
            {leftIcon}
          </div>
        )}
        {isTextVariant ? (
          <span className="ak-button-text" data-test-ak-button-text>
            {children}
          </span>
        ) : (
          children
        )}
        {!showLoading && rightIcon && (
          <div
            className={`ak-button-right-icon ${rightIconClass || ''}`}
            data-test-ak-button-right-icon
          >
            {rightIcon}
          </div>
        )}
      </Tag>
    );
  }
);

AkButton.displayName = 'AkButton';
