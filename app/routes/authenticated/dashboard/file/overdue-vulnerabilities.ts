import type Store from 'ember-data/store';
import { service } from '@ember/service';

import { ScrollToTop } from 'irene/utils/scroll-to-top';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';

export interface FileOverdueVulnerabilitiesQueryParams {
  limit: number;
  offset: number;
  ordering: string;
}

export default class AuthenticatedDashboardFileOverdueVulnerabilitiesRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare store: Store;

  queryParams = {
    limit: { refreshModel: true },
    offset: { refreshModel: true },
    ordering: { refreshModel: true },
  };

  async model(queryParams: Partial<FileOverdueVulnerabilitiesQueryParams>) {
    const { fileid } = this.paramsFor('authenticated.dashboard.file') as {
      fileid: string;
    };

    const file = await this.store.findRecord('file', fileid);

    return { file, queryParams };
  }
}
