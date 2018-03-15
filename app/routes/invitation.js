import Ember from 'ember';
import config from 'irene/config/environment';

const InvitationRoute = Ember.Route.extend({

  title: `Invitation${config.platform}`,

  model(params){
    return this.store.findRecord("invitation", params.uuid);
  }
});

export default InvitationRoute;
