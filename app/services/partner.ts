import Service from '@ember/service';
import { inject as service } from '@ember/service';
import Store from '@ember-data/store';

import OrganizationService from 'irene/services/organization';
import { PartnerAccessData } from 'irene/models/partner/partner';
import parseError from 'irene/utils/parse-error';

export default class PartnerService extends Service {
  @service declare store: Store;
  @service declare organization: OrganizationService;
  @service('notifications') declare notify: NotificationService;

  access: PartnerAccessData | null = null;
  id: string | null = null;

  async load(): Promise<void> {
    try {
      const partner = (await this.store.queryRecord('partner/partner', {})) as {
        id: string;
        access: PartnerAccessData;
      };

      this.id = partner.id;
      this.access = partner.access;
    } catch (err) {
      this.notify.error(parseError(err));
    }
  }
}
