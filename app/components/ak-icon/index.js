import Component from '@glimmer/component';

export default class AkIconComponent extends Component {
  variants = {
    filled: 'ak-icon',
    rounded: 'ak-icon-round',
    outlined: 'ak-icon-outlined',
  };

  get variantClass() {
    return this.variants[this.args.variant] || this.variants.filled;
  }
}
