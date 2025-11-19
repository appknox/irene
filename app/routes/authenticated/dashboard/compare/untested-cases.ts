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

import RouterService from '@ember/routing/router-service';

export default class AuthenticatedDashboardCompareUntestedCasesRoute extends AkBreadcrumbsRoute {
  @service declare store: Store;
  @service declare router: RouterService;

  parentRoute = 'authenticated.dashboard.compare';

  async model(): Promise<CompareChildrenRoutesModel> {
    const { files } = this.paramsFor(
      this.parentRoute
    ) as CompareRouteQueryParams;

    const [file1Id, file2Id] = files.split('...');

    const file1 = this.store.peekRecord('file', String(file1Id));
    const file2 = this.store.peekRecord('file', String(file2Id));

    const unknownAnalysisStatus = await this.store.queryRecord(
      'unknown-analysis-status',
      {
        id: file1?.profile.get('id'),
      }
    );

    if (!unknownAnalysisStatus.status) {
      this.router.transitionTo(
        'authenticated.dashboard.compare',
        `${file1Id}...${file2Id}`
      );
    }

    const { file1Analyses, file2Analyses } = this.modelFor(
      this.parentRoute
    ) as CompareRouteModel;

    const compareCategories = getFileComparisonCategories(
      compareFileAnalyses(file1Analyses, file2Analyses)
    );

    return {
      comparisonFilterKey: 'untested',
      filteredComparisons: compareCategories['untested'],
      files: [file1, file2],
    };
  }
}
