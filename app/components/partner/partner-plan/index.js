import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class PartnerPartnerPlanComponent extends Component {
  @service store;

  @tracked partnerPlan = {};

  @action
  initalize() {
    this.fetchPartnerPlan.perform();
  }

  @task(function* () {
    try {
      this.partnerPlan = yield this.store.queryRecord('partner/plan', {});
    } catch {
      this.partnerPlan = null;
      return;
    }
  })
  fetchPartnerPlan;
}
