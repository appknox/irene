import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import OidcService from 'irene/services/oidc';

export default class OidcAuthorizeRoute extends Route {
  @service declare oidc: OidcService;

  queryParams = {
    oidc_token: {
      refreshModel: true,
    },
  };

  async model({ oidc_token }: { oidc_token: string }) {
    return await this.oidc.fetchOidcAuthorizationDataOrRedirect(oidc_token);
  }
}
