import Component from '@glimmer/component';
import { action } from '@ember/object';
import dayjs from 'dayjs';

import type Saml2IdPMetadataModel from 'irene/models/saml2-idp-metadata';
import type OrganizationSsoModel from 'irene/models/organization-sso';

export interface SsoSettingsSamlIdpMetadataSignature {
  Args: {
    idpMetadata: Saml2IdPMetadataModel;
    sso: OrganizationSsoModel | null;
    openDeleteIdpMetadataConfirm: () => void;
  };
}

export default class SsoSettingsSamlIdpMetadataComponent extends Component<SsoSettingsSamlIdpMetadataSignature> {
  @action
  dateDisplayValue(date: Date) {
    return dayjs(date).format('DD MMM YYYY HH:mm:ss A');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'SsoSettings::Saml::IdpMetadata': typeof SsoSettingsSamlIdpMetadataComponent;
  }
}
