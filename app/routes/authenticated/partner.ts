import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import MeService from 'irene/services/me';
import PartnerService from 'irene/services/partner';

export default class AuthenticatedPartnerRoute extends Route {
  @service declare me: MeService;
  @service declare partner: PartnerService;

  async model() {
    // Load partner service
    await this.partner.load();
  }
}
