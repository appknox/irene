import Route from '@ember/routing/route';
import config from 'irene/config/environment';
import ScrollTopMixin from 'irene/mixins/scroll-top';
import { inject as service } from '@ember/service';

export default Route.extend(ScrollTopMixin, {
  me: service(),
  organization: service(),

  title: `Team${config.platform}`,

  async model(params){
    const orgId = this.get('organization').selected.id;
    return {
      team: await this.get('store').find('organization-team', params.teamid),
      organization: await this.get('store').find('organization', orgId)
    }
  }
});
