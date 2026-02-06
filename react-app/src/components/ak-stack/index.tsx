/**
 * AkStack Component
 * Custom stack layout component matching Ember ak-stack implementation exactly
 * Reference: app/components/ak-stack/
 */

import { type ReactNode, type HTMLAttributes, type ElementType } from 'react';
import { cva } from 'class-variance-authority';
import './index.scss';

type AkStackDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';
type AkStackJustifyContent =
  | 'start'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'
  | 'flex-end'
  | 'flex-start'
  | 'stretch'
  | 'end'
  | 'left'
  | 'right'
  | 'normal';

type AkStackAlignItems =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'stretch'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';

type AkStackFlexWrap = 'wrap' | 'nowrap' | 'wrap-reverse';
type AkStackWidth =
  | '1/12'
  | '2/12'
  | '3/12'
  | '4/12'
  | '5/12'
  | '6/12'
  | '7/12'
  | '8/12'
  | '9/12'
  | '10/12'
  | '11/12'
  | '12/12'
  | 'full'
  | 'fit-content'
  | 'auto';

type AkStackBgColor = 'white' | 'light';

const stackVariants = cva('ak-stack-root', {
  variants: {
    direction: {
      row: 'ak-stack-direction-row',
      'row-reverse': 'ak-stack-direction-row-reverse',
      column: 'ak-stack-direction-column',
      'column-reverse': 'ak-stack-direction-column-reverse',
    },
    alignItems: {
      'flex-start': 'ak-stack-align-items-flex-start',
      'flex-end': 'ak-stack-align-items-flex-end',
      center: 'ak-stack-align-items-center',
      stretch: 'ak-stack-align-items-stretch',
      'space-between': '',
      'space-around': '',
      'space-evenly': '',
    },
    justifyContent: {
      start: 'ak-stack-justifycontent-start',
      'flex-start': 'ak-stack-justifycontent-flex-start',
      center: 'ak-stack-justifycontent-center',
      stretch: 'ak-stack-justifycontent-stretch',
      normal: 'ak-stack-justifycontent-normal',
      'space-between': 'ak-stack-justifycontent-space-between',
      'space-around': 'ak-stack-justifycontent-space-around',
      'space-evenly': 'ak-stack-justifycontent-space-evenly',
      'flex-end': 'ak-stack-justifycontent-flex-end',
      right: 'ak-stack-justifycontent-right',
      left: 'ak-stack-justifycontent-left',
      end: 'ak-stack-justifycontent-end',
    },
    flexWrap: {
      nowrap: 'ak-stack-flexwrap-nowrap',
      wrap: 'ak-stack-flexwrap-wrap',
      'wrap-reverse': 'ak-stack-flexwrap-wrap-reverse',
    },
    width: {
      '1/12': 'ak-stack-width-1/12',
      '2/12': 'ak-stack-width-2/12',
      '3/12': 'ak-stack-width-3/12',
      '4/12': 'ak-stack-width-4/12',
      '5/12': 'ak-stack-width-5/12',
      '6/12': 'ak-stack-width-6/12',
      '7/12': 'ak-stack-width-7/12',
      '8/12': 'ak-stack-width-8/12',
      '9/12': 'ak-stack-width-9/12',
      '10/12': 'ak-stack-width-10/12',
      '11/12': 'ak-stack-width-11/12',
      '12/12': 'ak-stack-width-12/12',
      full: 'ak-stack-width-full',
      'fit-content': 'ak-stack-width-fit-content',
      auto: 'ak-stack-width-auto',
    },
    bgColor: {
      white: 'ak-stack-bg-color-white',
      light: 'ak-stack-bg-color-light',
    },
  },
  defaultVariants: {
    direction: 'row',
  },
});

interface AkStackProps extends HTMLAttributes<HTMLElement> {
  /** HTML tag to render */
  tag?: string;
  /** Spacing value (integer or float) */
  spacing?: string | number;
  /** Flex direction */
  direction?: AkStackDirection;
  /** Width */
  width?: AkStackWidth;
  /** Justify content */
  justifyContent?: AkStackJustifyContent;
  /** Align items */
  alignItems?: AkStackAlignItems;
  /** Flex wrap */
  flexWrap?: AkStackFlexWrap;
  /** Background color */
  bgColor?: AkStackBgColor;
  /** Children */
  children?: ReactNode;
}

export function AkStack({
  tag = 'div',
  spacing,
  direction = 'row',
  width,
  justifyContent,
  alignItems,
  flexWrap,
  bgColor,
  children,
  className,
  ...props
}: AkStackProps) {
  const Tag = tag as ElementType;

  // Calculate spacing unit class
  const getSpacingClass = () => {
    if (!spacing) return '';

    try {
      const spacingStr = String(spacing);
      const value = parseFloat(spacingStr);

      if (isNaN(value)) {
        return '';
      }

      // Integer value
      if (Math.ceil(value) === value) {
        return `ak-stack-spacing-${parseInt(String(value))}`;
      }

      // Float value - convert to fraction notation
      const numerator = parseInt(String(value * 2));
      return `ak-stack-spacing-${numerator}/2`;
    } catch {
      return '';
    }
  };

  const spacingClass = getSpacingClass();

  const stackClassName = stackVariants({
    direction,
    alignItems,
    justifyContent,
    flexWrap,
    width,
    bgColor,
  });

  const combinedClassName = [
    stackClassName,
    spacingClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag
      data-test-ak-stack
      className={combinedClassName}
      {...props}
    >
      {children}
    </Tag>
  );
}
