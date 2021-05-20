import Component from '@glimmer/component';
import {
  tracked
} from '@glimmer/tracking';
import {
  action,
  set
} from '@ember/object';

import {
  inject as service
} from '@ember/service';
export default class PartnerInvitationsComponent extends Component {

  @service intl;

  @tracked tabs = [{
    label: this.intl.t('pendingInvitations'),
    active: true,
    status: 'pending'
  }];

  // NOTE action could be used while adding more tab items
  @action
  switchTab(tab) {
    this.tabs.map((tab) => {
      set(tab, 'active', false);
    })
    set(tab, 'active', true);
  }
}
