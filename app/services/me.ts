import Service from '@ember/service';
import { service } from '@ember/service';
import Store from 'ember-data/store';
import { tracked } from '@glimmer/tracking';

import OrganizationMeModel from 'irene/models/organization-me';

export default class MeService extends Service {
  @service declare store: Store;

  @tracked organizationMe?: OrganizationMeModel;
  private fetchOrgMePromise?: Promise<OrganizationMeModel>;

  constructor(properties?: object) {
    super(properties);

    this.fetchOrganizationMe();
  }

  async fetchOrganizationMe() {
    if (this.organizationMe) {
      return this.organizationMe;
    }

    // Return the promise if it already exists
    if (this.fetchOrgMePromise !== undefined) {
      return this.fetchOrgMePromise;
    }

    // NOTE: We save the promise in a private property to avoid duplicate requests
    // and to ensure we only fetch the organization me once.
    // The "getMembership" method call usually leads to a duplicate request if this method is called twice.
    this.fetchOrgMePromise = this.queryOrganizationMe.then((result) => {
      this.organizationMe = result;
      this.fetchOrgMePromise = undefined;

      return result;
    });

    return this.fetchOrgMePromise;
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
