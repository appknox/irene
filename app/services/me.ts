import Service from '@ember/service';
import { inject as service } from '@ember/service';
import Store from '@ember-data/store';
import { tracked } from '@glimmer/tracking';

import OrganizationMeModel from 'irene/models/organization-me';

export default class MeService extends Service {
  @service declare store: Store;

  @tracked organization_me?: OrganizationMeModel;

  constructor(properties?: object) {
    super(properties);

    this.fetchOrganizationMe();
  }

  async fetchOrganizationMe() {
    this.organization_me = await this.queryOrganizationMe;
  }

  get queryOrganizationMe() {
    return this.store.queryRecord('organization-me', {});
  }

  get org() {
    return this.organization_me;
  }

  async getMembership() {
    const org = await this.queryOrganizationMe;
    const user_id = org.id;

    return this.store.findRecord('organization-member', user_id);
  }
}
