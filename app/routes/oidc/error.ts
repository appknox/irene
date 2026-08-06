import Route from '@ember/routing/route';

import type { OidcError } from 'irene/controllers/oidc/error';
import type OidcErrorController from 'irene/controllers/oidc/error';

export default class OidcErrorRoute extends Route {
  setupController(controller: OidcErrorController, error: OidcError) {
    controller.set('error', error);
  }
}
