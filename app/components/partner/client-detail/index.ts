import Component from '@glimmer/component';
import type PartnerclientModel from 'irene/models/partner/partnerclient';

export interface PartnerClientDetailComponentSignature {
  Args: {
    client: PartnerclientModel;
  };
}

export default class PartnerClientDetailComponent extends Component<PartnerClientDetailComponentSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Partner::ClientDetail': typeof PartnerClientDetailComponent;
  }
}
