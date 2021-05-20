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

export default class PartnerRegistrationRequestsComponent extends Component {

  @service intl;

  @tracked tabs = [{
      label: this.intl.t('pendingRequests'),
      active: true,
      status: 'pending'
    },
    {
      label: this.intl.t('rejectedRequests'),
      active: false,
      status: 'rejected'
    }
  ];

  @action
  switchTab(tab) {
    this.tabs.map((tab) => {
      set(tab, 'active', false);
    })
    set(tab, 'active', true);
  }

}
