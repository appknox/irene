import Component from '@glimmer/component';
import type { OrganizationSettingsIntegrationsRouteModel } from 'irene/routes/authenticated/dashboard/organization-settings/integrations';

export interface OrganizationIntegrationsSignature {
  Args: {
    model: OrganizationSettingsIntegrationsRouteModel;
  };
}

export default class OrganizationIntegrationsComponent extends Component<OrganizationIntegrationsSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::Integrations': typeof OrganizationIntegrationsComponent;
  }
}
