import Model, { attr } from '@ember-data/model';

export interface PartnerAccessData {
  view_plans: boolean;
  transfer_credits: boolean;
  list_projects: boolean;
  list_files: boolean;
  view_analytics: boolean;
  view_reports: boolean;
  admin_registration: boolean;
}

export default class PartnerModel extends Model {
  @attr()
  declare access: PartnerAccessData;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'partner/partner': PartnerModel;
  }
}
