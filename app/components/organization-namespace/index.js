/* eslint-disable ember/no-mixins, ember/no-classic-components, ember/no-classic-classes, ember/require-tagless-components, ember/avoid-leaking-state-in-ember-objects, ember/no-get */
import PaginateMixin from 'irene/mixins/paginate';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { t } from 'ember-intl';

import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';

export default Component.extend(PaginateMixin, {
  intl: service(),
  notify: service('notifications'),
  org: service('organization'),

  classNames: ['py-2 mt-2'],
  targetModel: 'organization-namespace',
  sortProperties: ['created:desc'],
  showRejectNamespaceConfirm: false,
  selectedNamespace: null,

  tNamespaceRejected: t('namespaceRejected'),
  tPleaseTryAgain: t('pleaseTryAgain'),

  hasNamespace: computed.gt('org.selected.namespacesCount', 0),

  columns: computed('intl', function () {
    return [
      {
        name: this.get('intl').t('namespace'),
        component: 'organization-namespace/namespace-value',
      },
      {
        name: this.get('intl').t('requestStatus'),
        component: 'organization-namespace/request-status',
      },
      {
        name: this.get('intl').t('approvalStatus'),
        component: 'organization-namespace/approval-status',
      },
    ];
  }),

  /* Open reject-namespace confirmation */
  rejectNamespaceConfirm: task(function* (namespace) {
    yield this.set('showRejectNamespaceConfirm', true);
    yield this.set('selectedNamespace', namespace);
  }),

  rejectNamespaceCancel: task(function* () {
    yield this.set('showRejectNamespaceConfirm', false);
    yield this.set('selectedNamespace', null);
  }),

  /* Reject namespace action */
  confirmReject: task(function* () {
    try {
      const namespace = this.get('selectedNamespace');

      namespace.deleteRecord();
      yield namespace.save();

      this.notify.success(this.get('tNamespaceRejected'));
      triggerAnalytics('feature', ENV.csb.namespaceRejected);

      this.set('showRejectNamespaceConfirm', false);
    } catch (err) {
      let errMsg = this.get('tPleaseTryAgain');

      if (err.errors && err.errors.length) {
        errMsg = err.errors[0].detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.notify.error(errMsg);
    }
  }),
});
