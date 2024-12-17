import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import IntlService from 'ember-intl/services/intl';
import { tracked } from 'tracked-built-ins';

interface StoreknoxProductIconSignature {
  Args: {
    product: 'sm' | 'vapt' | 'android' | 'ios';
    notClickable?: boolean;
    storeLink?: string;
  };
  Blocks: { default: [] };
}

export default class StoreknoxProductIcon extends Component<StoreknoxProductIconSignature> {
  @service declare intl: IntlService;

  @tracked anchorRef: HTMLElement | null = null;

  get productTitle() {
    return {
      vapt: this.intl.t('storeknox.vapt'),
      sm: this.intl.t('appMonitoring'),
      android: this.intl.t('storeknox.playStore'),
      ios: this.intl.t('storeknox.appStore'),
    };
  }

  get isAStore() {
    return ['android', 'ios'].indexOf(String(this.args.product)) > -1;
  }

  @action toggleProductInfo(event: Event) {
    if (this.args.notClickable) {
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
