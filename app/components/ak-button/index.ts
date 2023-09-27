import Component from '@glimmer/component';
import {
  TypographyColors,
  TypographyVariant,
  TypographyFontWeight,
} from '../ak-typography';

type ButtonColors = TypographyColors;
type ButtonVariants = TypographyVariant;
type ButtonFontWeight = TypographyFontWeight;
type ButtonTags = 'button' | 'a' | 'div' | 'label' | 'span';

export interface AkButtonSignature<T extends ButtonTags> {
  Element: HTMLElementTagNameMap[T];
  Args: {
    tag?: T;
    disabled?: boolean;
    variant?: 'filled' | 'text' | 'outlined';
    loading?: boolean;
    underline?: 'none' | 'always' | 'hover';
    iconSize?: 'small' | 'medium';
    type?: 'button' | 'reset' | 'submit';
    color?: ButtonColors;
    typographyVariant?: ButtonVariants;
    typographyFontWeight?: ButtonFontWeight;
    leftIconClass?: string;
    rightIconClass?: string;
  };

  Blocks: {
    default: [];
    leftIcon: [];
    rightIcon: [];
  };
}

export default class AkButtonComponent extends Component<
  AkButtonSignature<ButtonTags>
> {
  get tag() {
    return this.args.tag || 'button';
  }

  get isButton() {
    return this.tag === 'button';
  }

  get type() {
    return this.args.type || 'button';
  }

  get disabled() {
    return this.loading || this.args.disabled;
  }

  get variant() {
    return this.args.variant || 'filled';
  }

  get textVariant() {
    return this.args.variant === 'text';
  }

  get color() {
    return this.args.color || 'primary';
  }

  get loading() {
    return this.variant === 'filled' && this.args.loading;
  }

  get underlineNone() {
    return this.textVariant && this.args.underline === 'none';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkButton: typeof AkButtonComponent;
  }
}
