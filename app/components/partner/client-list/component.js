import Component from '@glimmer/component';

import {
  tracked
} from '@glimmer/tracking';

import {
  inject as service
} from '@ember/service';
import {
  PaginationMixin
} from '../../../mixins/paginate';
import {
  reads
} from '@ember/object/computed';
import {
  action
} from '@ember/object';
import {
  task
} from 'ember-concurrency';

export default class PartnerClientListComponent extends PaginationMixin(Component) {


  // Dependencies
  @service store;

  // Properties
  targetModel = 'partnerclient';

  @tracked clientList = [];

  @tracked isLoading = true;

  @reads('objects') clientList;

  @tracked partnerCreditStat = {};

  @action
  initializeComp() {
    this.fetchPartnerCreditStats.perform();
  }

  @task(function* () {
    try {
      this.partnerCreditStat = yield this.store.queryRecord('partner-credit-stat', {});
      console.log('partnerCreditStat', this.partnerCreditStat)
    } catch (e) {
      this.partnerCreditStat = {};
    }
  }) fetchPartnerCreditStats;
}
