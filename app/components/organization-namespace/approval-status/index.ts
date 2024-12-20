import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import { tracked } from '@glimmer/tracking';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import IntlService from 'ember-intl/services/intl';
import MeService from 'irene/services/me';
import OrganizationNamespaceModel from 'irene/models/organization-namespace';

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

      triggerAnalytics(
        'feature',
        ENV.csb['namespaceAdded'] as CsbAnalyticsFeatureData
      );

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
