/* eslint-disable ember/no-mixins, prettier/prettier, ember/no-get, ember/classic-decorator-no-classic-methods */
import Route from '@ember/routing/route';
import { ScrollTopMixin } from '../../../mixins/scroll-top';
import { inject as service } from '@ember/service';

export default class AuthenticatedOrganizationTeamRoute extends ScrollTopMixin(Route) {
  @service me;
  @service organization;

  async model(params){
    const orgId = this.get('organization').selected.id;
    return {
      team: await this.get('store').find('organization-team', params.teamid),
      organization: await this.get('store').find('organization', orgId)
    }
  }
}
