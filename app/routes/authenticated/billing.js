/* eslint-disable ember/no-mixins, prettier/prettier, ember/no-get, ember/classic-decorator-no-classic-methods */
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { ScrollTopMixin } from '../../mixins/scroll-top';
import ENV from 'irene/config/environment';

export default class AuthenticatedBillingRoute extends ScrollTopMixin(Route) {
  @service organization
  async model() {
    var org = await this.get('organization.selected');

    var showLicense = false;
    var license = {};
    if (ENV.showLicense) {
      try {
        license = await this.get('store').findRecord('license', this.get('organization.selected.id'));
        showLicense = true;
      } catch (error) {
        if (error.errors) {
          const status = error.errors[0].status;
          if (status == 403 || status == 404) {
            showLicense = false;
          }
        }
      }
    }

    return {
      organization: org,
      license: license,
      showLicense: showLicense,
    };
  }
}
