import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import type MeService from 'irene/services/me';
import type PartnerService from 'irene/services/partner';
import type UserModel from 'irene/models/user';

export default class AuthenticatedPartnerRoute extends Route {
  @service declare me: MeService;
  @service declare partner: PartnerService;

  async model() {
    // Load partner service
    await this.partner.load();

    return {
      user: this.modelFor('authenticated') as UserModel,
    };
  }
}
