import Component from '@glimmer/component';

import type GeoLocationModel from 'irene/models/geo-location';

export interface PrivacyModuleAppDetailsGeoLocationDomainNumbersSignature {
  Args: {
    geoLocation: GeoLocationModel;
  };
}

export default class PrivacyModuleAppDetailsGeoLocationDomainNumbersComponent extends Component<PrivacyModuleAppDetailsGeoLocationDomainNumbersSignature> {
  get domainNumbers() {
    return this.args.geoLocation.hostUrls.length;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppDetails::GeoLocation::DomainNumbers': typeof PrivacyModuleAppDetailsGeoLocationDomainNumbersComponent;
    'privacy-module/app-details/geo-location/domain-numbers': typeof PrivacyModuleAppDetailsGeoLocationDomainNumbersComponent;
  }
}
