import Component from '@glimmer/component';
import type PartnerPartnerclientProjectModel from 'irene/models/partner/partnerclient-project';

interface PartnerClientProjectListItemSignature {
  Args: {
    project: PartnerPartnerclientProjectModel;
    clientId: string;
    enableViewFiles: boolean;
  };
}

export default class PartnerClientProjectListItemComponent extends Component<PartnerClientProjectListItemSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Partner::ClientProjectList::Item': typeof PartnerClientProjectListItemComponent;
  }
}
