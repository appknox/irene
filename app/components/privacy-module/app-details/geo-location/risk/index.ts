import Component from '@glimmer/component';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type GeoLocationModel from 'irene/models/geo-location';

export interface PrivacyModuleAppDetailsGeoLocationRiskSignature {
  Args: {
    geoLocation: GeoLocationModel;
  };
}

export default class PrivacyModuleAppDetailsGeoLocationRiskComponent extends Component<PrivacyModuleAppDetailsGeoLocationRiskSignature> {
  @service declare intl: IntlService;

  get isHighRisk() {
    return this.args.geoLocation.isHighRiskRegion;
  }

  get color() {
    return this.isHighRisk ? 'error' : 'success';
  }

  get label() {
    return this.isHighRisk
      ? this.intl.t('high')
      : this.intl.t('privacyModule.noRisk');
  }

  get icon() {
    return this.isHighRisk ? 'warning' : 'check';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppDetails::GeoLocation::Risk': typeof PrivacyModuleAppDetailsGeoLocationRiskComponent;
    'privacy-module/app-details/geo-location/risk': typeof PrivacyModuleAppDetailsGeoLocationRiskComponent;
  }
}
