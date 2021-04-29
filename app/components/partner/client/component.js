import Component from '@glimmer/component';
import {
  inject as service
} from '@ember/service';

import {
  tracked
} from '@glimmer/tracking';
import {
  computed,
  action
} from '@ember/object';
import {
  task
} from 'ember-concurrency';

export default class PartnerClientComponent extends Component {

  @service store;

  @tracked members = [];

  @tracked isShowCreditAllocationModal = false;

  @tracked isShowMemberListModal = false;

  @computed('members.meta.count')
  get totalMembers() {
    return this.members.meta ? this.members.meta.count : 0;
  }

  @computed('args.client.id')
  get extraQueryStrings() {
    return JSON.stringify({
      clientId: this.args.client.id
    });
  }

  @action
  initializeComp() {
    this.fetchMembers.perform();
  }

  @action
  onShowCreditTransferModal() {
    this.isShowCreditAllocationModal = true;
  }

  @action
  onCloseModal() {
    this.isShowCreditAllocationModal = false;
    // Refresh model with new credit bal
    this.store.find('client', this.args.client.id)
  }

  @action
  onToggleMemberListModal(isOpen = true) {
    this.isShowMemberListModal = isOpen;
  }

  @task(function* () {
    this.members = yield this.store.query('client-member', {
      clientId: this.args.client.id,
      limit: 5,
      offset: 0
    })
  }) fetchMembers;
}
