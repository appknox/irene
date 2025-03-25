import Component from '@glimmer/component';
import type PartnerPartnerclientProjectModel from 'irene/models/partner/partnerclient-project';

export interface PartnerClientProjectDetailComponentSignature {
  Args: {
    project: PartnerPartnerclientProjectModel;
  };
}

export default class PartnerClientProjectDetailComponent extends Component<PartnerClientProjectDetailComponentSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Partner::ClientProjectDetail': typeof PartnerClientProjectDetailComponent;
  }
}
