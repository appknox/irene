import Component from '@glimmer/component';
import { TypographyColors, TypographyVariant } from '../ak-typography';

type ButtonColors = TypographyColors;
type ButtonVariants = TypographyVariant;

export interface AkButtonSignature {
  Element: HTMLButtonElement;
  Args: {
    disabled?: boolean;
    variant?: 'filled' | 'text' | 'outlined';
    loading?: boolean;
    underline?: 'none';
    iconSize?: 'small' | 'medium';
    type?: 'button' | 'reset' | 'submit';
    color?: ButtonColors;
    typographyVariant?: ButtonVariants;
    leftIconClass?: string;
    rightIconClass?: string;
  };

  Blocks: {
    default: [];
    leftIcon: [];
    rightIcon: [];
  };
}

export default class AkButtonComponent extends Component<AkButtonSignature> {
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
