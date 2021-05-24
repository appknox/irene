import Component from '@glimmer/component';
import { inject } from '@ember/service';
import { task }  from 'ember-concurrency';
import parseError from 'irene/utils/parse-error';

export default class PartnerInvitationComponent extends Component {
  @inject intl;
  @inject store;
  @inject realtime;
  @inject('notifications') notify;

  @task(function* (request) {
    try {
      yield request.resend();
      this.realtime.incrementProperty('RegistrationRequestCounter');
      this.notify.success(`Resend invitation to ${request.email}`);
    } catch (err) {
      this.notify.error(parseError(err));
    }
  })
  resendInvite;

  // @task(function* (request) {
  //   try {
  //     const email = request.email;
  //     yield request.destroyRecord();
  //     this.realtime.incrementProperty('RegistrationRequestCounter');
  //     this.notify.success(`Deleted invitation to ${email}`);
  //   } catch (err) {
  //     this.notify.error(parseError(err));
  //   }
  // })
  // deleteInvite;
}
