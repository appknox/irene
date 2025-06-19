import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import { ScrollToTop } from 'irene/utils/scroll-to-top';
import type { FileDASTResultsModel } from '../results';

export default class AuthenticatedFileDynamicScanResultsIndexRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  model() {
    return this.modelFor(
      'authenticated.dashboard.file.dynamic-scan.results'
    ) as FileDASTResultsModel;
  }
}
