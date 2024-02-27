import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

import OidcService, { OidcAuthorizationResponse } from 'irene/services/oidc';

export interface OidcAuthorizeSignature {
  Args: {
    token?: string;
    data?: OidcAuthorizationResponse;
  };
}

export default class OidcAuthorizeComponent extends Component<OidcAuthorizeSignature> {
  @service declare oidc: OidcService;

  constructor(owner: unknown, args: OidcAuthorizeSignature['Args']) {
    super(owner, args);

    this.authorizeIfNoUserAuthorizationNeeded();
  }

  get applicationName() {
    return this.args.data?.form_data?.application_name;
  }

  get scopeDescriptions() {
    return this.args.data?.form_data?.scopes_descriptions;
  }

  authorizeIfNoUserAuthorizationNeeded() {
    const formData = this.args.data?.form_data;

    const authorizationNotNeeded =
      typeof formData !== 'undefined' &&
      formData !== null &&
      !formData.authorization_needed;

    if (authorizationNotNeeded) {
      this.oidc.authorizeOidcAppPermissions.perform(this.args.token as string);
    }
  }

  cancelAuthorization = task(async () => {
    await this.oidc.authorizeOidcAppPermissions.perform(
      this.args.token as string,
      false
    );
  });

  allowAuthorization = task(async () => {
    await this.oidc.authorizeOidcAppPermissions.perform(
      this.args.token as string,
      true
    );
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    OidcAuthorize: typeof OidcAuthorizeComponent;
  }
}
