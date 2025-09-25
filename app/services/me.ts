import Service from '@ember/service';
import { service } from '@ember/service';
import Store from '@ember-data/store';
import { tracked } from '@glimmer/tracking';

import OrganizationMeModel from 'irene/models/organization-me';

export default class MeService extends Service {
  @service declare store: Store;

  @tracked organizationMe?: OrganizationMeModel;
  private _organizationMePromise?: Promise<OrganizationMeModel>;

  constructor(properties?: object) {
    super(properties);

    this.fetchOrganizationMe();
  }

  async fetchOrganizationMe() {
    if (this._organizationMePromise != undefined) {
      this._organizationMePromise = this.store
        .queryRecord('organization-me', {})
        .then((org) => {
          this.organizationMe = org;
          return org;
        });
    }

    return this._organizationMePromise;
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
