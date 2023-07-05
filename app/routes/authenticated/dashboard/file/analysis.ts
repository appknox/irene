import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import Store from '@ember-data/store';

export default class AuthenticatedFileAnalysisRoute extends Route {
  @service declare store: Store;

  activate() {
    window.scrollTo(0, 0);
  }

  model(params: { analysis_id: string }) {
    return this.store.findRecord('analysis', params.analysis_id);
  }
}
