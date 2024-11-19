import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class ClientPlanComponent extends Component {
  @service store;
  @service partner;

  @tracked clientPlan = null;

  @task(function* () {
    try {
      this.clientPlan = yield this.store.findRecord(
        'partner/partnerclient-plan',
        this.args.clientId
      );
    } catch (err) {
      this.clientPlan = null;
      return;
    }
  })
  getClientPlan;
}
