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


export default class CardsClientInfoComponent extends Component {

  @service('notifications') notify;
  @service intl;

  @computed('args.type')
  get isRegistered() {
    return this.args.type === 'registered';
  }

  @computed('args.type')
  get isInvited() {
    return this.args.type === 'invited';
  }

  @computed('args.type')
  get isSelfRegistered() {
    return this.args.type === 'self-registered';
  }

  @task(function* () {
    try {
      const success = yield this.args.client.approve(this.args.client.id);
      this.notify.success(success.message);
    } catch (e) {
      this.notify.error(`Please try again later`);
    }

  }) approveRegistration;

  @task(function* () {
    try {
      const success = yield this.args.client.resendInvitation(this.args.client.id);
      this.notify.success(success.message)
    } catch (e) {
      this.notify.error(`Couldn't resend invitiation, please try again later!`);
    }

  }) resendInvitation;

}
