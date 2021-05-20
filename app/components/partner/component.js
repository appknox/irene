import Component from '@glimmer/component';
import {
  inject as service
} from '@ember/service';
import {
  action,
  set
} from '@ember/object';
import {
  tracked
} from '@glimmer/tracking';

export default class PartnerComponent extends Component {

  @service intl;
  @service store;
  @service router;
  @service partner;

  @tracked tabs = [{
      label: this.intl.t('clients'),
      active: true,
      enabled: true,
      link: 'authenticated.partner.clients'
    },
    {
      label: this.intl.t('registrationRequests'),
      active: false,
      enabled: this.partner.access.invite_clients,
      link: 'authenticated.partner.registration-requests'
    },
    {
      label: this.intl.t('invitations'),
      active: false,
      enabled: this.partner.access.invite_clients,
      link: 'authenticated.partner.invitations'
    }
  ];

  @tracked showInviteModal = false;

  @action
  initalize() {
    this.setDefaultTab();
  }

  @action
  switchTab(tab) {
    this.tabs.map((tab) => {
      set(tab, 'active', false);
    })
    set(tab, 'active', true);
  }

  @action
  toggleInviteModal() {
    this.showInviteModal = !this.showInviteModal;
  }

  setDefaultTab() {
    const loadedTab = this.tabs.findBy('link', this.router.currentRouteName);
    if (loadedTab) {
      this.switchTab(loadedTab);
    }
  }

}
