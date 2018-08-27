import Ember from 'ember';
import config from 'irene/config/environment';
import ScrollTopMixin from 'irene/mixins/scroll-top';

export default Ember.Route.extend(ScrollTopMixin, {
  title: `Team${config.platform}`,

  async model(params, transition){
    return {
      team: await this.get('store').find('organization-team', params.teamId),
      organization: await this.get('store').find('organization', transition.params['authenticated.organization'].id)
    }
  }
});
