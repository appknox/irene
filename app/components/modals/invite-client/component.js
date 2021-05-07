import Component from '@glimmer/component';
import Changeset from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';
import {
  action
} from '@ember/object';
import {
  tracked
} from '@glimmer/tracking';
import {
  task
} from 'ember-concurrency';
import {
  inject as service
} from '@ember/service';
import ClientInvite from 'irene/validations/client-invite';

export default class ModalsInviteClient extends Component {

  @service store;

  @service me;

  @tracked changeset = {};

  @tracked client = {
    firstName: null,
    lastName: null,
    email: null,
    company: null,
    isTrail: true
  };

  constructor() {
    super(...arguments);
    this.changeset = new Changeset(this.client, lookupValidator(ClientInvite), ClientInvite);
  }

  @action
  onChangeTrail(inType) {
    if (inType == 'checkbox') {
      this.changeset.set('isTrail', !this.changeset.get('isTrail'))
    }
  }


  @task(function* () {
    yield this.changeset.validate()
    if (this.changeset.get('isValid')) {
      const invitedClient = yield this.store.createRecord('client-invite', this.changeset.change).save();
      this.args.onInvited(invitedClient)
    }
  }) sendInvitation;
}
