import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AuthenticatedGithubRedirectRoute extends Route {
  @service ajax;
  @service('notification-messages-service') notify;
  @service organization;

  async beforeModel(transition){
    const token = encodeURIComponent(transition.queryParams.token);
    const url = `/api/organizations/${this.get('organization.selected.id')}/github`;
    try{
      let data = await this.get("ajax").post(url, {data:{token: token}})
      this.get("notify").success(`Successfully Integrated with user ${data.login}`);
    }catch(err){
      this.get("notify").error(`Error Occured: ${err.payload.message}`);
    }
  }

  afterModel(){
    return this.transitionTo('authenticated.organization.settings');
  }
}
