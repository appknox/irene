import Component from '@glimmer/component';

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
};

type TypographyVariant = keyof typeof variantMapping;

export interface AkTypographySignature {
  Element: HTMLElement;
  Args: {
    tag: keyof HTMLElementTagNameMap;
    variant: TypographyVariant;
    color:
      | 'inherit'
      | 'textPrimary'
      | 'textSecondary'
      | 'primary'
      | 'secondary'
      | 'success'
      | 'error'
      | 'info'
      | 'warn';
    gutterBottom: boolean;
    align: 'inherit' | 'left' | 'right' | 'center' | 'justify';
    noWrap: boolean;
    underline: 'none' | 'always' | 'hover';
  };
  Blocks: { default: [] };
}

export default class AkTypography extends Component<AkTypographySignature> {
  defaultVariant: TypographyVariant = 'body1';

  get tag() {
    if (this.args.tag) {
      return this.args.tag;
    }

    if (this.args.variant) {
      return variantMapping[this.args.variant] || 'span';
    }

    return variantMapping[this.defaultVariant];
  }

  get variant() {
    if (this.args.variant) {
      return variantMapping[this.args.variant]
        ? this.args.variant
        : this.defaultVariant;
    }

    return this.defaultVariant;
  }

  get color() {
    return this.args.color || 'textPrimary';
  }

  get gutterBottom() {
    return this.args.gutterBottom ? 'gutter-bottom' : 'no-gutter-bottom';
  }

  get align() {
    return this.args.align || 'inherit';
  }

  get underline() {
    return this.args.underline || 'none';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkTypography: typeof AkTypography;
  }
}
