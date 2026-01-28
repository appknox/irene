import { inject as service } from '@ember/service';
import Store from 'ember-data/store';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';

export default class AuthenticatedSecurityFileRoute extends AkBreadcrumbsRoute {
  @service declare store: Store;

  async model(params: { fileid: string }) {
    return this.store.findRecord('security/file', params.fileid);
  }
}
