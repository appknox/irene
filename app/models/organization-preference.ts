import Model, { attr } from '@ember-data/model';

interface ReportPreferenceData {
  show_gdpr: boolean;
  show_hipaa: boolean;
  show_pcidss: boolean;
  show_nist: boolean;
}

export default class OrganizationPreferenceModel extends Model {
  @attr()
  declare reportPreference: ReportPreferenceData;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'organization-preference': OrganizationPreferenceModel;
  }
}
