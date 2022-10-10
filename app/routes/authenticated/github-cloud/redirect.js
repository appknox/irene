/* eslint-disable ember/no-get, ember/classic-decorator-no-classic-methods */
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AuthenticatedGithubRedirectRoute extends Route {
  @service ajax;
  @service('notifications') notify;
  @service organization;

  async beforeModel(transition) {
    const token = encodeURIComponent(transition.to.queryParams.token);
    const url = `/api/organizations/${this.get(
      'organization.selected.id'
    )}/github`;
    try {
      let data = await this.get('ajax').post(url, { data: { token: token } });
      this.get('notify').success(
        `Successfully Integrated with user ${data.login}`
      );
    } catch (err) {
      this.get('notify').error(`Error Occured: ${err.payload.message}`);
    }
  }

  afterModel() {
    return this.transitionTo('authenticated.organization-settings');
  }
}
