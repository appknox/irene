import Component from '@glimmer/component';

export interface AkIconSignature {
  Element: HTMLSpanElement;
  Args: {
    variant?: 'filled' | 'rounded' | 'outlined';
    iconName: string;
    size?: 'medium' | 'small';
    color?:
      | 'inherit'
      | 'textPrimary'
      | 'textSecondary'
      | 'primary'
      | 'secondary'
      | 'success'
      | 'error'
      | 'info'
      | 'warn';
  };
}

export default class AkIconComponent extends Component<AkIconSignature> {
  variants = {
    filled: 'ak-icon',
    rounded: 'ak-icon-round',
    outlined: 'ak-icon-outlined',
  };

  get variantClass() {
    const variant = this.args.variant || 'filled';
    return this.variants[variant];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkIcon: typeof AkIconComponent;
  }
}
