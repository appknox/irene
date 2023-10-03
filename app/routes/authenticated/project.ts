import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import Store from '@ember-data/store';

export interface ProjectRouteQueryParams {
  projectid: string;
}

export default class AuthenticatedProjectRoute extends Route {
  @service declare store: Store;

  model(params: ProjectRouteQueryParams) {
    return this.store.findRecord('project', params.projectid);
  }
}
