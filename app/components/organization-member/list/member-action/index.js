import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';

export default class OrganizationMemberListMemberAction extends Component {
  @service intl;
  @service me;
  @service('notifications') notify;

  @tracked modaltitle = null;
  @tracked showEditModal = false;
  @tracked moreBtnAnchorRef = null;

  tPleaseTryAgain = this.intl.t('pleaseTryAgain');
  tActivated = this.intl.t('activated');
  tDeactivated = this.intl.t('deactivated');
  tUserActivateTitle = this.intl.t('userActivateTitle');
  tUserDeactivateTitle = this.intl.t('userDeactivateTitle');

  @action
  editMemberSetting() {
    this.handleMoreBtnMenuClose();

    if (this.args.member.member.get('isActive')) {
      this.modaltitle = this.tUserDeactivateTitle;
    } else {
      this.modaltitle = this.tUserActivateTitle;
    }

    this.showEditModal = true;
  }

  @action
  handleMoreBtnClicked(event) {
    this.moreBtnAnchorRef = event.currentTarget;
  }

  @action
  handleMoreBtnMenuClose() {
    this.moreBtnAnchorRef = null;
  }

  @task
  *changeSetting() {
    try {
      const member = yield this.args.member.member;

      member.set('isActive', !member.get('isActive'));
      yield member.save();

      this.showEditModal = false;

      const message = member.get('isActive')
        ? this.tActivated
        : this.tDeactivated;

      this.notify.success(`${message} ${member.username}`);
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

  @action
  closeModal() {
    this.showEditModal = false;
  }
}
