import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import WhitelabelService from 'irene/services/whitelabel';

export interface RegisterOidcErrorSignature {
  Args: {
    title: string;
    message: string;
    contactSupportLink?: string;
  };
  Blocks: {
    default: [];
  };
}

export default class RegisterOidcErrorComponent extends Component<RegisterOidcErrorSignature> {
  @service declare whitelabel: WhitelabelService;

  get isWhitelabled() {
    return this.whitelabel.isEnabled();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    RegisterOidcError: typeof RegisterOidcErrorComponent;
  }
}
