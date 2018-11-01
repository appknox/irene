import config from 'irene/config/environment';
import Route from '@ember/routing/route';

const InvitationRoute = Route.extend({

  title: `Invitation${config.platform}`,

  model(params){
    return this.store.findRecord("invitation", params.uuid);
  }
});

export default InvitationRoute;
