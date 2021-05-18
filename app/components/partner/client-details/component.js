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

export default class PartnerClientDetailsComponent extends Component {

  @service partner;
  @service store;

  @tracked clientPlan = {};
  @tracked clientStatistics = {};

  @task(function* () {
    this.clientPlan = yield this.store.find('partnerclient-plan', this.args.client.id);
  }) getClientPlan;

  @task(function* () {
    this.clientStatistics = yield this.store.find('partnerclient-statistic', this.args.client.id);
  }) getClientStatistics;

}
