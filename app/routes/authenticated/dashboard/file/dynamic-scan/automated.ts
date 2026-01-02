import { inject as service } from '@ember/service';
import type Store from 'ember-data/store';
import type RouterService from '@ember/routing/router-service';

import { ScrollToTop } from 'irene/utils/scroll-to-top';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type ConfigurationService from 'irene/services/configuration';

export default class AuthenticatedFileDastAutomatedDastRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare store: Store;
  @service declare router: RouterService;
  @service declare configuration: ConfigurationService;

  get orgIsAnEnterprise() {
    return this.configuration.serverData.enterprise;
  }

  beforeModel() {
    if (this.orgIsAnEnterprise) {
      this.router.transitionTo(
        'authenticated.dashboard.file.dynamic-scan.manual'
      );
    }
  }

  async model() {
    const { fileid } = this.paramsFor('authenticated.dashboard.file') as {
      fileid: string;
    };

    const file = await this.store.findRecord('file', fileid);

    return {
      file,
      profileId: (await file.project).activeProfileId,
    };
  }
}
