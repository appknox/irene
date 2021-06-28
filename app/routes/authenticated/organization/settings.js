import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AuthenticatedOrganizationSettingsRoute extends Route {
  @service me;
  @service organization;
  @service('notifications') notify;

  async model() {
    const url = `/api/organizations/${this.get(
      'organization.selected.id'
    )}/github`;
    let integratedUser = null;
    let reconnect = null;
    try {
      let data = await this.get('ajax').request(url);
      if (data) {
        integratedUser = data;
      }
    } catch (err) {
      if (err.status === 400) {
        reconnect = true;
      }
    }
    await this.get('store').query('organization', { id: null });
    return {
      integratedUser: integratedUser,
      reconnect: reconnect,
      user: await this.modelFor('authenticated'),
      organization: await this.get('organization.selected'),
      me: this.me,
    };
  }
}
