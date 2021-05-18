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

  @tracked clientStatistics = {};

  @computed('args.client.name')
  get isEmptyTitle() {
    return isEmpty(this.args.client.name);
  }

  @action
  onAddCredits() {
    this.isShowCreditAllocationModal = true;
  }

  @action
  onCloseModal() {
    this.isShowCreditAllocationModal = false;
    // Refresh model with new credit bal
    this.store.queryRecord('credits/partner-credits-stat', {})
    this.store.find('partnerclient', this.args.client.id);
  }

  @task(function* () {
    this.clientPlan = yield this.store.find('partnerclient-plan', this.args.client.id);
  }) getClientPlan;

  @task(function* () {
    this.clientStatistics = yield this.store.find('partnerclient-statistic', this.args.client.id);
  }) getClientStatistics;

}
