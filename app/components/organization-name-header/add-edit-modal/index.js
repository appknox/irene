import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import ENV from 'irene/config/environment';
import { tracked } from '@glimmer/tracking';

import triggerAnalytics from 'irene/utils/trigger-analytics';

class OrganizationNameAddEditModal extends Component {
  @service intl;
  @service('notifications') notify;

  @tracked newOrUpdatedOrgName = '';
  @tracked showSuccessMessage = false;

  tPleaseTryAgain = this.intl.t('pleaseTryAgain');

  constructor() {
    super(...arguments);

    this.newOrUpdatedOrgName = this.args.organization.name;
  }

  get actionType() {
    return this.args.editModal ? 'edit' : 'add';
  }

  get modalHeaderTitle() {
    if (this.showSuccessMessage) {
      return this.intl.t('message');
    }

    return this.args.editModal
      ? this.intl.t('editName')
      : this.intl.t('addName');
  }

  get inputPlaceholder() {
    return this.args.organization.name || this.intl.t('organizationName');
  }

  get inputLabel() {
    return this.args.editModal
      ? this.intl.t('organizationNameEditLabel')
      : this.intl.t('organizationNameAddLabel');
  }

  @task()
  *updateOrgName() {
    const org = this.args.organization;
    const existingName = org.name;

    try {
      yield org.set('name', this.newOrUpdatedOrgName);
      yield org.save();

      this.showSuccessMessage = true;
      triggerAnalytics('feature', ENV.csb.updateOrgName);
    } catch (err) {
      org.set('name', existingName);

      let errMsg = this.tPleaseTryAgain;

      if (err.errors && err.errors.length) {
        errMsg = err.errors[0].detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.notify.error(errMsg);
    }
  }
}

export default OrganizationNameAddEditModal;
