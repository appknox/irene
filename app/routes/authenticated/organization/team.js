import Ember from 'ember';
import config from 'irene/config/environment';
import ScrollTopMixin from 'irene/mixins/scroll-top';

export default Ember.Route.extend(ScrollTopMixin, {
  me: Ember.inject.service(),
  organization: Ember.inject.service(),

  title: `Team${config.platform}`,

  model(params){
    const orgId = this.get('organization').selected.id;
    return {
      team: this.get('store').find('organization-team', params.teamId),
      organization: this.get('store').find('organization', orgId)
    }
  }
});
