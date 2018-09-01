import Ember from 'ember';
import ENV from 'irene/config/environment';

const InviteRoute = Ember.Route.extend({
  title: `Invitation`,
  ajax: Ember.inject.service(),

  async model(params){
    const token = params.token;
    const url = [ENV.endpoints.invite, token].join('/')
    const ret = await this.get("ajax").request(url)
    return ret;
  }
});

export default InviteRoute;
