import Helper from '@ember/component/helper';
import IntlService from 'ember-intl/services/intl';
import { inject as service } from '@ember/service';

type Positional = [string];

export interface StoreNameForUrlSignature {
  Args: {
    Positional: Positional;
  };
  Return: string;
}

const GOOGLE_PLAYSTORE_DOMAIN = 'play.google.com';
const APPLE_APPSTORE_DOMAIN = 'apps.apple.com';

export default class StoreNameForUrlHelper extends Helper<StoreNameForUrlSignature> {
  @service declare intl: IntlService;

  compute(params: Positional): string {
    const [storeUrl] = params;

    const url = new URL(storeUrl);

    switch (url.hostname) {
      case GOOGLE_PLAYSTORE_DOMAIN:
        return this.intl.t('googlePlayStore');

      case APPLE_APPSTORE_DOMAIN:
        return this.intl.t('appleAppStore');

      default:
        return this.intl.t('storeLowercase');
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'store-name-for-url': typeof StoreNameForUrlHelper;
  }
}
