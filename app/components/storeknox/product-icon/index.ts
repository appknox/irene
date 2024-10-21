import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from 'tracked-built-ins';

interface StoreknoxProductIconSignature {
  Args: {
    product?: 'sm' | 'vapt' | 'android' | 'ios';
  };
  Blocks: { default: [] };
}

export default class StoreknoxProductIcon extends Component<StoreknoxProductIconSignature> {
  @tracked anchorRef: HTMLElement | null = null;

  productTitle = {
    vapt: 'VAPT',
    sm: 'Store Monitoring',
    android: 'Play Store',
    ios: 'App Store',
  };

  get isAStore() {
    return ['android', 'ios'].indexOf(String(this.args.product)) > -1;
  }

  @action toggleProductInfo(event: Event) {
    if (!this.args.product) {
      return;
    }

    if (this.anchorRef) {
      this.closeProductInfo();

      return;
    }

    this.anchorRef = event.currentTarget as HTMLElement;
  }

  @action closeProductInfo() {
    this.anchorRef = null;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::ProductIcon': typeof StoreknoxProductIcon;
  }
}
