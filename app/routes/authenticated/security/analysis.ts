import { service } from '@ember/service';
import type Store from 'ember-data/store';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import { ScrollToTop } from 'irene/utils/scroll-to-top';

export default class AuthenticatedSecurityAnalysisDetailsRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare store: Store;

  async model(params: { analysisid: string }) {
    const analysisDetails = await this.store.findRecord(
      'security/analysis',
      params.analysisid
    );

    const analysisFile = await analysisDetails?.get('file');
    const analysisProjectID = analysisFile.get('project')?.get('id');

    return {
      analysisDetails,
      analysisFile,
      analysisProjectID,
      analysisId: params.analysisid,
    };
  }
}
