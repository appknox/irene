import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { t } from 'ember-intl';

export default Component.extend({
  me: service('me'),
  notify: service('notification-messages-service'),

  tIntegrationsPermissionDenied: t('integrationsPermissionDenied'),

  showIntegrationsPermissionDenied: task(function* () {
    yield this.get('notify').error(this.get('tIntegrationsPermissionDenied'));
  }),
});
