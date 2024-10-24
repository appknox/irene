import Route from '@ember/routing/route';
import { ScrollToTop } from 'irene/utils/scroll-to-top';

export default class AuthenticatedSecurityAnalysisDetailsRoute extends ScrollToTop(
  Route
) {
  model(params: { analysisid: string }) {
    return params.analysisid;
  }
}
