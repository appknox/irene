import Component from '@glimmer/component';

import type { GeoMapData } from '..';

interface PrivacyModuleAppDetailsGeoLocationDetailsDrawerSignature {
  Args: {
    selectedCountry: GeoMapData | null;
    open?: boolean;
    onClose: () => void;
  };
}

export default class PrivacyModuleAppDetailsGeoLocationDetailsDrawerComponent extends Component<PrivacyModuleAppDetailsGeoLocationDetailsDrawerSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppDetails::GeoLocation::DetailsDrawer': typeof PrivacyModuleAppDetailsGeoLocationDetailsDrawerComponent;
  }
}
