import Route from '@ember/routing/route';

export default class InvitationRoute extends Route {
  model(params){
    return this.store.findRecord("invitation", params.uuid);
  }
}
