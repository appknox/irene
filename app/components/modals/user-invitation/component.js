import Component from '@glimmer/component';
import {
  inject as service
} from '@ember/service';
import {
  action
} from '@ember/object';
import {
  tracked
} from '@glimmer/tracking';
import Changeset from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';
import {
  task
} from 'ember-concurrency';
import UserInvite from 'irene/validations/user-invite';

export default class ModalsUserInvitation extends Component {

  @service store;

  @service me;

  @tracked changeset = {};

  @tracked user = {
    firstName: null,
    lastName: null,
    email: null,
    company: null,
  };

  @action
  initializeCompo() {
    this.changeset = new Changeset(this.user, lookupValidator(UserInvite), UserInvite);
  }


  @task(function* () {
    yield this.changeset.validate()
    if (this.changeset.get('isValid')) {
      yield this.store.createRecord('client-invite', this.changeset.change).save();
    }
  }) sendInvitation;
}
