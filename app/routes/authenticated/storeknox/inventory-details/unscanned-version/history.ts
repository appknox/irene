import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import Store from '@ember-data/store';
import RouterService from '@ember/routing/router-service';

import AmAppModel from 'irene/models/am-app';
import OrganizationService from 'irene/services/organization';
import AmConfigurationModel from 'irene/models/amconfiguration';

export interface InventoryDetailsDetailsQueryParams {
  am_app_id: string | number;
}

export default class AuthenticatedStoreknoxInventoryDetailsUnscannedVersionsHistoryRoute extends Route {
  @service declare organization: OrganizationService;
  @service declare store: Store;
  @service declare router: RouterService;

  parentRoute = 'authenticated.storeknox.inventory-details.unscanned-version';

  async model(): Promise<{
    settings?: AmConfigurationModel;
    amApp: AmAppModel;
  }> {
    const { am_app_id } = this.paramsFor(
      this.parentRoute
    ) as InventoryDetailsDetailsQueryParams;

    const amApp = await this.store.findRecord('am-app', am_app_id);

    const orgModel = this.organization.selected;
    const AmSettings = await orgModel?.get_am_configuration();

    return {
      settings: AmSettings,
      amApp,
    };
  }
}
