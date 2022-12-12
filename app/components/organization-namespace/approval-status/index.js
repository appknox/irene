import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import { tracked } from '@glimmer/tracking';

export default class OrganizationNamespaceApprovalStatus extends Component {
  @service intl;
  @service me;
  @service('notifications') notify;

  @tracked isApprovingNamespace = false;

  tNamespaceApproved = this.intl.t('namespaceApproved');
  tPleaseTryAgain = this.intl.t('pleaseTryAgain');

  /* Approve namespace action */
  @task
  *approveNamespace() {
    try {
      this.isApprovingNamespace = true;

      const ns = this.args.namespace;
      ns.set('isApproved', true);

      yield ns.save();

      this.notify.success(this.tNamespaceApproved);
      triggerAnalytics('feature', ENV.csb.namespaceAdded);

      this.isApprovingNamespace = false;
    } catch (err) {
      let errMsg = this.tPleaseTryAgain;

      if (err.errors && err.errors.length) {
        errMsg = err.errors[0].detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.notify.error(errMsg);
      this.isApprovingNamespace = false;
    }
  }
}
