import Store from '@ember-data/store';
import RouterService from '@ember/routing/router-service';
import { inject as service } from '@ember/service';
import { debug } from '@ember/debug';
import { action } from '@ember/object';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import { ScrollToTop } from 'irene/utils/scroll-to-top';

export interface CompareRouteQueryParams {
  files: string;
  vulnerability_id: string;
}

export default class AuthenticatedDashboardFileVulCompareRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare store: Store;
  @service declare router: RouterService;

  @action
  error(error: AdapterError) {
    if (error?.errors && error.errors[0]?.status === '404') {
      this.router.transitionTo('/not-found');
    }
  }

  async model(params: CompareRouteQueryParams) {
    const { files, vulnerability_id } = params;

    const [file1Id, file2Id] = files.split('...');

    debug(
      `Comparing vulnerability with id - ${vulnerability_id} of files ${file1Id} and ${file2Id}`
    );

    const file1 = await this.store.findRecord('file', String(file1Id));
    const file2 = await this.store.findRecord('file', String(file2Id));

    const vulnerability = await this.store.findRecord(
      'vulnerability',
      vulnerability_id
    );

    return {
      controllerProps: { packageName: file1.get('project') },
      file1,
      file2,
      vulnerability,
    };
  }
}
