import Route from '@ember/routing/route';

import { inject as service } from '@ember/service';
import { translationMacro as t } from 'ember-i18n';

const AuthenticatedGithubRedirectRoute = Route.extend({

  i18n: service(),
  ajax: service(),
  notify: service('notification-messages-service'),
  organization: service('organization'),
  tErrorOccured: t('errorOccured'),
  tGithubIntegratedSuccessful: t('githubIntegratedSuccessful'),

  async beforeModel(transition){
    const token = encodeURIComponent(transition.queryParams.token);
    const url = `/api/organizations/${this.get('organization.selected.id')}/github`;
    try{
      let data = await this.get("ajax").post(url, {data:{token: token}})
      this.get("notify").success(`${this.get("tGithubIntegratedSuccessful")} ${data.login}`);
    }catch(err){
      this.get("notify").error(`${this.get('tErrorOccured')} ${err.payload.message}`);
    }
  },
  afterModel(){
    this.transitionTo('authenticated.organization.settings');
  }
});

export default AuthenticatedGithubRedirectRoute;
