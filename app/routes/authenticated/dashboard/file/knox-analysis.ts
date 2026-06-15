import { service } from '@ember/service';
import type Store from 'ember-data/store';

import { ScrollToTop } from 'irene/utils/scroll-to-top';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';

export default class AuthenticatedFileKnoxAnalysisRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare store: Store;

  model(params: { analysis_id: string }) {
    return this.store.findRecord('analysis', params.analysis_id, {
      reload: true,
    });
  }
}
