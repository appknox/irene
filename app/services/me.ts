import Service from '@ember/service';
import { inject as service } from '@ember/service';
import Store from '@ember-data/store';
import { tracked } from '@glimmer/tracking';

import OrganizationMeModel from 'irene/models/organization-me';

export default class MeService extends Service {
  @service declare store: Store;

  @tracked organizationMe?: OrganizationMeModel;

  constructor(properties?: object) {
    super(properties);

    this.fetchOrganizationMe();
  }

  async fetchOrganizationMe() {
    this.organizationMe = await this.queryOrganizationMe;
  }

  get queryOrganizationMe() {
    return this.store.queryRecord('organization-me', {});
  }

  get org() {
    return this.organizationMe;
  }

  async getMembership() {
    const org = await this.queryOrganizationMe;
    const userId = org.id;

    return this.store.findRecord('organization-member', userId);
  }

  async user() {
    const org = await this.queryOrganizationMe;
    const userId = org.id;
    return this.store.findRecord('user', userId);
  }
}
