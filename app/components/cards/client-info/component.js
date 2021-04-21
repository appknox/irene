import Component from '@glimmer/component';
import {
  task
} from 'ember-concurrency';
import {
  computed,
  action
} from '@ember/object';
import {
  inject as service
} from '@ember/service';
import {
  tracked
} from '@glimmer/tracking'


export default class CardsClientInfoComponent extends Component {

  @service('notifications') notify;
  @service intl;
  @service store;

  @tracked isShowCreditAllocationModal = false;

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

  @action
  onAddCredits() {
    this.isShowCreditAllocationModal = true;
  }

  @action
  onCloseModal() {
    this.isShowCreditAllocationModal = false;
    // Refresh model with new credit bal
    this.store.queryRecord('credits/partner-credits-stat', {})
    this.store.find('client', this.args.client.id);
  }

  @task(function* () {
    try {
      const success = yield this.args.client.approve(this.args.client.id);
      this.notify.success(success.message);
    } catch (e) {
      this.notify.error(this.intl.t('pleaseTryAgain'));
    }

  }) approveRegistration;

  @task(function* () {
    try {
      const success = yield this.args.client.resendInvitation(this.args.client.id);
      this.notify.success(success.message)
    } catch (e) {
      this.notify.error(this.intl.t("clients.resendInvitationFail"));
    }

  }) resendInvitation;

}
