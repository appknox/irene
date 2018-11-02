import Route from '@ember/routing/route';
import config from 'irene/config/environment';
import ScrollTopMixin from 'irene/mixins/scroll-top';

export default Route.extend(ScrollTopMixin, {
  title: `Organizations${config.platform}`,
  model() {
    return this.get("store").query('organization', {id: null});
  },
  redirect(model, transition){
    const currentRoute = transition.targetName;
    if(currentRoute === "authenticated.organizations") {
        this.transitionTo(`/organization/${model.content[0].id}/members`);
    }
  }

});
