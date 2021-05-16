import Component from '@glimmer/component';
import {
  inject as service
} from '@ember/service';
// import parseError from 'irene/utils/parse-error';
import {
  action
} from '@ember/object';
import {
  task
} from 'ember-concurrency';
import {
  tracked
} from '@glimmer/tracking';

export default class PartnerComponent extends Component {

  @service store;
  @service('notifications') notify;
  @service me;
  @service ajax;
  @service intl;

  @tracked creditsStats = {};

  clientGroups = [{
    label: this.intl.t('clients'),
    key: 'registered',
    model: 'client',
    active: true,
    link: 'authenticated.partner.clients'
  }];

  @action
  initializeComp() {
    this.fetchPartnerCreditStats.perform();
  }

  @task(function* () {
    try {
      this.creditsStats = yield this.store.queryRecord('partner-credit-stat', {});
      console.log('this.creditsStats', this.creditsStats)
    } catch (e) {
      console.log('e', e)
      this.creditsStats = {};
    }
  }) fetchPartnerCreditStats;

}
