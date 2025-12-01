import { service } from '@ember/service';
import Store from '@ember-data/store';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';

import {
  type CompareChildrenRoutesModel,
  type CompareRouteQueryParams,
} from 'irene/routes/authenticated/dashboard/compare';

export default class AuthenticatedDashboardCompareNewIssuesRoute extends AkBreadcrumbsRoute {
  @service declare store: Store;

  parentRoute = 'authenticated.dashboard.compare';

  async model(): Promise<CompareChildrenRoutesModel> {
    const { files } = this.paramsFor(
      this.parentRoute
    ) as CompareRouteQueryParams;

    const [file1Id, file2Id] = files.split('...');

    const file1 = this.store.peekRecord('file', String(file1Id));
    const file2 = this.store.peekRecord('file', String(file2Id));

    return {
      comparisonFilterKey: 'recurring',
      files: [file1, file2],
    };
  }
}
