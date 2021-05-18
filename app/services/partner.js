import Service from '@ember/service';
import {
  inject as service
} from '@ember/service';

/**
 * Service:PartnerService
 */
export default class PartnerService extends Service {

  @service store;
  @service organization;

  access = {};

  id = null;

  async load() {
    try {
      const partner = await this.store.queryRecord('partner', {});
      this.id = partner.id;
      this.access = partner.access;
    } catch (err) {
      //
    }
  }
}
