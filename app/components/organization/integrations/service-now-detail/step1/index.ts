import Component from '@glimmer/component';

import type { ChangesetBufferProps } from '../index';

export interface OrganizationIntegrationsServiceNowDetailStep1Signature {
  Args: {
    changeset: ChangesetBufferProps;
    autoPush: boolean;
    onToggleAutoPush: (event: Event, checked?: boolean) => void;
  };
}

export default class OrganizationIntegrationsServiceNowDetailStep1Component extends Component<OrganizationIntegrationsServiceNowDetailStep1Signature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::Integrations::ServiceNowDetail::Step1': typeof OrganizationIntegrationsServiceNowDetailStep1Component;
  }
}
