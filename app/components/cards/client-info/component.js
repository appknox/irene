import Component from '@glimmer/component';
import {
  task
} from 'ember-concurrency';
import {
  computed
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

  @tracked clientPlan = {};

  @tracked clientStatistics = {};

  @computed('args.client.name')
  get isEmptyTitle() {
    return isEmpty(this.args.client.name);
  }

  @task(function* () {
    try {
      this.clientPlan = yield this.store.find('partnerclient-plan', this.args.client.id);
    } catch (err) {
      return;
    }
  }) getClientPlan;

}
