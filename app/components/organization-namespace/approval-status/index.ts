import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type IntlService from 'ember-intl/services/intl';

import type MeService from 'irene/services/me';
import type AnalyticsService from 'irene/services/analytics';
import type OrganizationNamespaceModel from 'irene/models/organization-namespace';

dayjs.extend(relativeTime);

export interface OrganizationNamespaceApprovalStatusSignature {
  Args: {
    namespace: OrganizationNamespaceModel;
    onRejectNamespace: (namespace: OrganizationNamespaceModel) => void;
  };
  Element: HTMLElement;
}

export default class OrganizationNamespaceApprovalStatus extends Component<OrganizationNamespaceApprovalStatusSignature> {
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service declare analytics: AnalyticsService;
  @service('notifications') declare notify: NotificationService;

  @tracked isApprovingNamespace = false;

  /* Approve namespace action */
  approveNamespace = task(async () => {
    try {
      this.isApprovingNamespace = true;

      const ns = this.args.namespace;
      ns.set('isApproved', true);

      await ns.save();

      this.notify.success(this.intl.t('namespaceApproved'));

      this.analytics.track({
        name: 'ORGANIZATION_NAMESPACE_EVENT',
        properties: {
          feature: 'approve_namespace',
          namespaceId: ns.id,
        },
      });

      this.isApprovingNamespace = false;
    } catch (e) {
      const err = e as AdapterError;
      let errMsg = this.intl.t('pleaseTryAgain');

      if (err.errors && err.errors.length) {
        errMsg = err.errors[0]?.detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.notify.error(errMsg);
      this.isApprovingNamespace = false;
    }
  });

  get approvedOnDate() {
    return dayjs(this.args.namespace.approvedOn).fromNow();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OrganizationNamespace::ApprovalStatus': typeof OrganizationNamespaceApprovalStatus;
  }
}
