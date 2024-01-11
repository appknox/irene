import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import Store from '@ember-data/store';
import { ScrollToTop } from 'irene/utils/scroll-to-top';

export default class AuthenticatedFileAnalysisRoute extends ScrollToTop(Route) {
  @service declare store: Store;

  model(params: { analysis_id: string }) {
    return this.store.findRecord('analysis', params.analysis_id);
  }
}
