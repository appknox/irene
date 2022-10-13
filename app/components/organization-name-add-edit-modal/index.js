import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';
import { action } from '@ember/object';
import ENV from 'irene/config/environment';
import { tracked } from '@glimmer/tracking';

import triggerAnalytics from 'irene/utils/trigger-analytics';

class OrganizationNameAddEditModal extends Component {
  @service intl;
  @service('notifications') notify;

  @tracked newOrUpdatedOrgName = '';
  @tracked showSuccessMessage = false;
  @tracked actionType = 'edit';

  tPleaseTryAgain = this.intl.t('pleaseTryAgain');

  constructor() {
    super(...arguments);

    this.newOrUpdatedOrgName = this.args.organization.name;

    if (this.orgNameDoesNotExist) {
      this.actionType = 'add';
    }
  }

  get orgNameDoesNotExist() {
    return this.args.organization.name === '';
  }

  @action handleOrgNameChange({ target }) {
    this.newOrUpdatedOrgName = target.value;
  }

  @task()
  *updateOrgName() {
    try {
      const org = this.args.organization;

      yield org.set('name', this.newOrUpdatedOrgName);
      yield org.save();

      this.showSuccessMessage = true;
      triggerAnalytics('feature', ENV.csb.updateOrgName);
    } catch (err) {
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
