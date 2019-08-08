import config from 'irene/config/environment';
import ENV from 'irene/config/environment';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { translationMacro as t } from 'ember-i18n';

export default Route.extend({
  i18n: service(),
  tAccountActivated: t('accountActivated'),
  title: `Activate${config.platform}`,
  model(params) {
    const url = [ENV.endpoints.activate, params.pk, params.token].join('/');
    return this.get('ajax').request(url);
  },
  redirect() {
    this.get("notify").info(this.get('tAccountActivated'));
    this.transitionTo('login');
  }
});
