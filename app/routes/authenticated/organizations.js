import Ember from 'ember';
import config from 'irene/config/environment';
import ScrollTopMixin from 'irene/mixins/scroll-top';

export default Ember.Route.extend(ScrollTopMixin, {
  title: `Organization${config.platform}`,
  model(){
    return this.get('store').findAll('organization');
  },
  redirect(model, transition){
    const currentRoute = transition.targetName;
    if(currentRoute === "authenticated.organizations") {
        this.transitionTo(`/organization/${model.content[0].id}/users`);
    }
  }
});
