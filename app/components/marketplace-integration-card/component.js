/* eslint-disable ember/no-classic-components, ember/no-classic-classes, ember/require-tagless-components, ember/no-get */
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { t } from 'ember-intl';

export default Component.extend({
  me: service('me'),
  notify: service('notifications'),

  tIntegrationsPermissionDenied: t('integrationsPermissionDenied'),

  showIntegrationsPermissionDenied: task(function* () {
    yield this.get('notify').error(this.get('tIntegrationsPermissionDenied'));
  }),
});
