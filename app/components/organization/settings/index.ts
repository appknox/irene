import Component from '@glimmer/component';
import { service } from '@ember/service';
import type MeService from 'irene/services/me';
import type { OrganizationSettingsRouteModel } from 'irene/routes/authenticated/dashboard/organization-settings/index';

export interface OrganizationSettingsSignature {
  Args: {
    model: OrganizationSettingsRouteModel;
  };
}

export default class OrganizationSettingsComponent extends Component<OrganizationSettingsSignature> {
  @service declare me: MeService;
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::Settings': typeof OrganizationSettingsComponent;
  }
}
