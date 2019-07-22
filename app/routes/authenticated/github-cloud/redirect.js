import Route from '@ember/routing/route';

import { inject as service } from '@ember/service';

const AuthenticatedGithubRedirectRoute = Route.extend({
  ajax: service(),
  notify: service('notification-messages-service'),
  organization: service('organization'),

  async beforeModel(transition){
    const token = encodeURIComponent(transition.queryParams.token);
    const url = `/api/organizations/${this.get('organization.selected.id')}/github`;
    try{
      let data = await this.get("ajax").post(url, {data:{token: token}})
      this.get("notify").success(`Successfully Integrated with user ${data.login}`);
    }catch(err){
      this.get("notify").error(`Error Occured: ${err.payload.message}`);
    }
  },
  afterModel(){
    this.transitionTo('authenticated.organization.settings');
  }
});

export default AuthenticatedGithubRedirectRoute;
