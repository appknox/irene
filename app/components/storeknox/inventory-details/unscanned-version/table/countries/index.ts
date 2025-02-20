import Component from '@glimmer/component';
import { service } from '@ember/service';
import type Store from '@ember-data/store';

import { COUNTRY_NAMES_MAP } from 'irene/utils/constants';
import type SkAppVersionModel from 'irene/models/sk-app-version';

interface StoreknoxInventoryDetailsUnscannedVersionTableCountriesSignature {
  Args: {
    skAppVersion: SkAppVersionModel;
  };
}

export default class StoreknoxInventoryDetailsUnscannedVersionTableCountriesComponent extends Component<StoreknoxInventoryDetailsUnscannedVersionTableCountriesSignature> {
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  get skAppVersion() {
    return this.args.skAppVersion;
  }

  get countryCodes() {
    return this.skAppVersion?.skStoreInstances
      ?.slice()
      ?.map((si) => si.countryCode);
  }

  get showEmptyCountryList() {
    return this.countryCodes?.length < 1;
  }

  get countryNamesMap(): Record<string, string> {
    return COUNTRY_NAMES_MAP;
  }
}
