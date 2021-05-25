import Component from '@glimmer/component';
import {
  task
} from 'ember-concurrency';
import {
  computed,
  action
} from '@ember/object';
import {
  inject as service
} from '@ember/service';
import {
  tracked
} from '@glimmer/tracking'
import {
  isEmpty
} from '@ember/utils';


export default class CardsClientInfoComponent extends Component {
  @service('notifications') notify;
  @service intl;
  @service store;
  @service partner;

  @tracked isShowCreditAllocationModal = false;
  @tracked clientPlan = {};
  @tracked showOwnerEmails = false;

  ownerEmailCount = this.args.client.ownerEmails.length - 1;

  @action
  toggleOwnerEmailList() {
    this.showOwnerEmails = !this.showOwnerEmails;
  }

  @computed('args.client.name')
  get isEmptyTitle() {
    return isEmpty(this.args.client.name);
  }

  @task(function* () {
    this.clientPlan = yield this.store.find('partner/partnerclient-plan', this.args.client.id);
  })
  getClientPlan;
}
