import Component from '@glimmer/component';

class AkTypography extends Component {
  defaultVariant = 'body1';

  variantMapping = {
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

  get tag() {
    if (this.args.tag) {
      return this.args.tag;
    }

    if (this.args.variant) {
      return this.variantMapping[this.args.variant] || 'span';
    }

    return this.variantMapping[this.defaultVariant];
  }

  get variant() {
    if (this.args.variant) {
      return this.variantMapping[this.args.variant]
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

export default AkTypography;
