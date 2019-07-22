import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  me: service(),
  organization: service(),
  notify: service('notification-messages-service'),
  async model(){
    const url = `/api/organizations/${this.get('organization.selected.id')}/github`
    let integratedUser = null;
    let reconnect=null
    try{
        let data = await this.get("ajax").request(url);
        if (data){
          integratedUser = data;
        }
      }catch(err){
        if (err.status===400){
          reconnect=true
        }
    }
    await this.get("store").query('organization', {id: null});
    return {integratedUser: integratedUser, reconnect: reconnect};
  }
});
