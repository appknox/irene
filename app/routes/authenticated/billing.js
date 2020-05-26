import Route from '@ember/routing/route';
import config from 'irene/config/environment';
import { inject as service } from '@ember/service';
import ScrollTopMixin from 'irene/mixins/scroll-top';
import ENV from 'irene/config/environment';

const AuthenticatedBillingRoute = Route.extend(ScrollTopMixin, {
  title: `Billing${config.platform}`,
  organization: service('organization'),
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
});

export default AuthenticatedBillingRoute;
