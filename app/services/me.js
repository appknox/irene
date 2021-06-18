import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default class MeService extends Service {
  @service store;
  @service notifications;
  @service organization;

  organization_me = null;

  get org() {
    if (!this.organization_me) {
      this.organization_me = this.store.queryRecord('organization-me', {});
    }
    return this.organization_me;
  }

  async getMembership() {
    const org = await this.org;
    const user_id = org.id;
    return this.store.findRecord('organization-member', user_id);
  }

  get partner() {
    return this.org.partner;
  }
}
