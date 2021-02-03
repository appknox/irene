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
    console.log('ClientInvite', ClientInvite)
    this.changeset = new Changeset(this.client, lookupValidator(ClientInvite), ClientInvite);
  }

  @action
  onChangeTrail(inType) {
    if (inType == 'checkbox') {
      this.changeset.set('isTrail', !this.changeset.get('isTrail'))
    }
  }


  @task(function* () {
    console.log('changeset', this.changeset)
    const invitedClient = yield this.store.createRecord('client-invite', this.changeset.change).save();
    this.store.pushPayload('client-invite', invitedClient)
    this.args.onInvited(invitedClient)
  }) sendInvitation;
}
