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
    first_name: '',
    last_name: '',
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
      try {
        yield this.ajax.post(`registration_requests`, {
          namespace: 'api/v2',
          data: this.changeset.change
        });
        this.notify.success(this.intl.t('invitationSent'));
        this.args.onSent();
      } catch (err) {
        this.notify.error(parseError(err));
      }

    }
  }) sendInvitation;
}
