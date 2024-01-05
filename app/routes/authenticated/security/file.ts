import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import Store from '@ember-data/store';

export default class AuthenticatedSecurityFileRoute extends Route {
  @service declare store: Store;

  async model(params: { fileid: string }) {
    await this.store.findAll('Vulnerability');

    return this.store.findRecord('security/file', params.fileid);
  }
}
