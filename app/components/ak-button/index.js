import Component from '@glimmer/component';

export default class AkButtonComponent extends Component {
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
