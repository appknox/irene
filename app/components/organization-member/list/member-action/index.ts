import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import IntlService from 'ember-intl/services/intl';
import MeService from 'irene/services/me';
import OrganizationMemberModel from 'irene/models/organization-member';

interface OrganizationMemberListMemberActionSignature {
  Args: {
    member: OrganizationMemberModel;
  };
  Element: HTMLDivElement;
}

export default class OrganizationMemberListMemberAction extends Component<OrganizationMemberListMemberActionSignature> {
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service('notifications') declare notify: NotificationService;

  @tracked modaltitle: string | null = null;
  @tracked showEditModal = false;
  @tracked moreBtnAnchorRef: HTMLElement | null = null;

  @action
  editMemberSetting() {
    this.handleMoreBtnMenuClose();

    if (this.args.member.member.get('isActive')) {
      this.modaltitle = this.intl.t('userDeactivateTitle');
    } else {
      this.modaltitle = this.intl.t('userActivateTitle');
    }

    this.showEditModal = true;
  }

  @action
  handleMoreBtnClicked(event: Event) {
    this.moreBtnAnchorRef = event.currentTarget as HTMLElement;
  }

  @action
  handleMoreBtnMenuClose() {
    this.moreBtnAnchorRef = null;
  }

  changeSetting = task(async () => {
    try {
      const member = await this.args.member.member;

      member.set('isActive', !member.get('isActive'));
      await member.save();

      this.showEditModal = false;

      const message = member.get('isActive')
        ? this.intl.t('activated')
        : this.intl.t('deactivated');

      this.notify.success(`${message} ${member.username}`);
    } catch (e) {
      const err = e as AdapterError;
      let errMsg = this.intl.t('pleaseTryAgain');

      if (err.errors && err.errors.length) {
        errMsg = err.errors[0]?.detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.notify.error(errMsg);
    }
  });

  @action
  closeModal() {
    this.showEditModal = false;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    OrganizationMemberListMemberAction: typeof OrganizationMemberListMemberAction;
  }
}
