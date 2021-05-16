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
import {
  isEmpty
} from '@ember/utils';


export default class CardsClientInfoComponent extends Component {

  @service('notifications') notify;
  @service intl;
  @service store;


  @tracked showCreditTransferModal = false;

  @computed('args.client.name')
  get isEmptyTitle() {
    return isEmpty(this.args.client.name);
  }

  @action
  toggleCreditTransferModal() {
    this.showCreditTransferModal = !this.showCreditTransferModal;
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
