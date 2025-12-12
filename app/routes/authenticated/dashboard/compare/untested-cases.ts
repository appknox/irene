import { service } from '@ember/service';
import Store from 'ember-data/store';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';

import {
  CompareChildrenRoutesModel,
  CompareRouteQueryParams,
} from 'irene/routes/authenticated/dashboard/compare';

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
    const unknownAnalysisStatus = file1?.project.get('showUnknownAnalysis');

    if (!unknownAnalysisStatus) {
      this.router.transitionTo(
        'authenticated.dashboard.compare',
        `${file1Id}...${file2Id}`
      );
    }

    return {
      comparisonFilterKey: 'untested',
      files: [file1, file2],
    };
  }
}
