import { inject as service } from '@ember/service';
import Store from '@ember-data/store';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';

import {
  CompareChildrenRoutesModel,
  CompareRouteModel,
  CompareRouteQueryParams,
} from 'irene/routes/authenticated/dashboard/compare';

import {
  compareFileAnalyses,
  getFileComparisonCategories,
} from 'irene/utils/compare-files';

export default class AuthenticatedDashboardCompareRecurringIssuesRoute extends AkBreadcrumbsRoute {
  @service declare store: Store;

  parentRoute = 'authenticated.dashboard.compare';

  async model(): Promise<CompareChildrenRoutesModel> {
    const { files } = this.paramsFor(
      this.parentRoute
    ) as CompareRouteQueryParams;

    const { file1Analyses, file2Analyses } = this.modelFor(
      this.parentRoute
    ) as CompareRouteModel;

    const [file1Id, file2Id] = files.split('...');

    const file1 = this.store.peekRecord('file', String(file1Id));
    const file2 = this.store.peekRecord('file', String(file2Id));

    const compareCategories = getFileComparisonCategories(
      compareFileAnalyses(file1Analyses, file2Analyses)
    );

    return {
      comparisonFilterKey: 'newRisks',
      filteredComparisons: compareCategories['newRisks'],
      files: [file1, file2],
    };
  }
}
