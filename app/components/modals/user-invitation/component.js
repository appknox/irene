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
import parseError from 'irene/utils/parse-error';

export default class ModalsUserInvitation extends Component {

  @service store;
  @service ajax;
  @service('notifications') notify;
  @service intl;


  @service me;

  @tracked changeset = {};

  @tracked user = {
    email: null,
    company: null,
    first_name: '',
    last_name: '',
  };

  @action
  initializeCompo() {
    this.changeset = new Changeset(this.user, lookupValidator(UserInvite), UserInvite);
  }


  @task(function* () {
    yield this.changeset.validate()
    if (this.changeset.get('isValid')) {
      try {
        const userData = {
          email: this.changeset.get('email'),
          data: {
            first_name: this.changeset.get('first_name'),
            last_name: this.changeset.get('last_name'),
            company: this.changeset.get('company')
          }
        }
        yield this.store.createRecord('partner/registration-request', userData).save();
        this.notify.success(this.intl.t('invitationSent'));
        this.args.onSent();
      } catch (err) {
        this.notify.error(parseError(err));
      }

    }
  }) sendInvitation;
}
