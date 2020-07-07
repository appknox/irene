import Route from '@ember/routing/route';

export default class AuthenticatedProjectRoute extends Route {
  model(params){
    return this.store.findRecord("project", params.projectid);
  }
}
