import Service from '@ember/service';
import { service } from '@ember/service';
import Store from '@ember-data/store';
import { tracked } from '@glimmer/tracking';

import OrganizationMeModel from 'irene/models/organization-me';

export default class MeService extends Service {
  @service declare store: Store;

  @tracked organizationMe?: OrganizationMeModel;
  private fetchPromise?: Promise<OrganizationMeModel>;

  constructor(properties?: object) {
    super(properties);

    this.fetchOrganizationMe();
  }

  async fetchOrganizationMe() {
    if (this.organizationMe) {
      return this.organizationMe;
    }

    this.fetchPromise = this.queryOrganizationMe.then((result) => {
      this.organizationMe = result;
      this.fetchPromise = undefined;

      return result;
    });

    return this.fetchPromise;
  }

  get queryOrganizationMe() {
    return this.store.queryRecord('organization-me', {});
  }

  get org() {
    return this.organizationMe;
  }

  async getMembership() {
    const org = await this.fetchOrganizationMe();

    return this.store.findRecord('organization-member', org.id);
  }

  async user() {
    const org = await this.fetchOrganizationMe();

    return this.store.findRecord('user', org.id);
  }
}
