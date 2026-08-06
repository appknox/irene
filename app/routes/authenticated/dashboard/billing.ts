import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import type Store from 'ember-data/store';

import ENV from 'irene/config/environment';
import type OrganizationService from 'irene/services/organization';
import { ScrollToTop } from 'irene/utils/scroll-to-top';
import type LicenseModel from 'irene/models/license';

export default class AuthenticatedDashboardBillingRoute extends ScrollToTop(
  Route
) {
  @service declare organization: OrganizationService;
  @service declare store: Store;

  async model() {
    let license: LicenseModel | null = null;

    if (ENV.showLicense) {
      try {
        license = await this.store.findRecord(
          'license',
          this.organization.selected?.id as string
        );
      } catch (err) {
        const error = err as AdapterError;

        if (error.errors) {
          const status = error.errors[0]?.status;

          if (status === 403 || status == 404) {
            license = null;
          }
        }
      }
    }

    return {
      organization: this.organization.selected,
      license: license,
    };
  }
}
