import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';

export default class OrganizationNamespaceComponent extends Component {
  @service intl;
  @service('notifications') notify;
  @service me;
  @service store;
  @service router;

  @tracked showRejectNamespaceConfirm = false;
  @tracked selectedNamespace = null;
  @tracked namespaceResponse = null;

  tNamespaceRejected = this.intl.t('namespaceRejected');
  tPleaseTryAgain = this.intl.t('pleaseTryAgain');

  constructor() {
    super(...arguments);
    const { namespaceLimit, namespaceOffset } = this.args.queryParams;

    this.fetchNamespace.perform(namespaceLimit, namespaceOffset);
  }

  get namespaceList() {
    return this.namespaceResponse?.toArray() || [];
  }

  get totalNamespaceCount() {
    return this.namespaceResponse?.meta?.count || 0;
  }

  get hasNoNamespace() {
    return this.totalNamespaceCount === 0;
  }

  get columns() {
    return [
      {
        name: this.intl.t('namespace'),
        component: 'organization-namespace/namespace-value',
      },
      {
        name: this.intl.t('requestStatus'),
        component: 'organization-namespace/request-status',
      },
      {
        name: this.intl.t('approvalStatus'),
        component: 'organization-namespace/approval-status',
      },
    ];
  }

  /* Open reject-namespace confirmation */
  @action
  rejectNamespaceConfirm(namespace) {
    this.showRejectNamespaceConfirm = true;
    this.selectedNamespace = namespace;
  }

  @action
  rejectNamespaceCancel() {
    this.showRejectNamespaceConfirm = false;
    this.selectedNamespace = null;
  }

  @action
  handleNextAction({ limit, offset }) {
    this.router.transitionTo({
      queryParams: { namespace_limit: limit, namespace_offset: offset },
    });

    this.fetchNamespace.perform(limit, offset);
  }

  @action
  handlePrevAction({ limit, offset }) {
    this.router.transitionTo({
      queryParams: { namespace_limit: limit, namespace_offset: offset },
    });

    this.fetchNamespace.perform(limit, offset);
  }

  @action
  handleItemPerPageChange({ limit }) {
    this.router.transitionTo({
      queryParams: { namespace_limit: limit, namespace_offset: 0 },
    });

    this.fetchNamespace.perform(limit, 0);
  }

  fetchNamespace = task(async (limit, offset) => {
    try {
      this.namespaceResponse = await this.store.query(
        'organization-namespace',
        {
          limit,
          offset,
        }
      );
    } catch (err) {
      let errMsg = this.tPleaseTryAgain;

      if (err.errors && err.errors.length) {
        errMsg = err.errors[0].detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.notify.error(errMsg);
    }
  });

  /* Reject namespace action */
  confirmReject = task(async () => {
    try {
      const namespace = this.selectedNamespace;

      namespace.deleteRecord();
      await namespace.save();

      this.notify.success(this.tNamespaceRejected);
      triggerAnalytics('feature', ENV.csb.namespaceRejected);

      this.showRejectNamespaceConfirm = false;
    } catch (err) {
      let errMsg = this.tPleaseTryAgain;

      if (err.errors && err.errors.length) {
        errMsg = err.errors[0].detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.notify.error(errMsg);
    }
  });
}
