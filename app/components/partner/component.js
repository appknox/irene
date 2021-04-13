import Component from '@glimmer/component';
import {
  inject as service
} from '@ember/service';
import {
  task
} from 'ember-concurrency';
import {
  tracked
} from '@glimmer/tracking';
import {
  action,
  set
} from '@ember/object';

export default class PartnerComponent extends Component {

  @service store;
  @service('notification') notify;

  @tracked isShowInviteClientModal = false;

  @tracked clientGroups = [{
      label: 'Registered Clients',
      key: 'registered',
      model: 'client',
      active: true
    },
    {
      label: 'Invited Users',
      key: 'invited',
      model: 'client-invite',
      active: false
    },
    {
      label: 'Self Registered Users',
      key: 'self-registered',
      model: 'self-register-client',
      active: false
    }
  ];

  @tracked creditsStats = {};

  @action
  initializeComp() {
    this.fetchPartnerCreditStats.perform();
  }

  @action
  onSelectClientGroup(clientGroup) {
    // console.log('clientGroup', clientGroup)
    // this.clientGroups.map((group) => group.active = clientGroup.key === group.key);
    // console.log('clientGroups', this.clientGroups)
    // this.activeClientGroup = clientGroup;
    // clientGroup.active = true;
    this.clientGroups.map((group) =>
      set(group, 'active', clientGroup.key == group.key)
    )
  }

  @action
  onClientInvited(client) {
    console.log('invited', client)
    this.isShowInviteClientModal = false;
    this.clientGroups.map((group) =>
      set(group, 'active', group.key == 'invited')
    )
    this.notify.success(`Invitation has been sent to: ${client.email}`);
  }

  @action
  openInviteModal() {
    this.isShowInviteClientModal = true;
  }

  @action
  onCloseModal() {
    this.isShowInviteClientModal = false;
  }

  @task(function* () {
    try {
      this.creditsStats = yield this.store.queryRecord('credits/partner-credits-stat', {});
    } catch (e) {
      this.creditsStats = {};
    }
  }) fetchPartnerCreditStats;
}
