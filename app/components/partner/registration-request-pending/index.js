import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import parseError from 'irene/utils/parse-error';

export default class PartnerRegistrationRequestPendingComponent extends Component {
  @service realtime;
  @service('notifications') notify;

  @tracked request;

  @task(function* (request) {
    try {
      yield request.updateStatus('approved');
      this.realtime.incrementProperty('RegistrationRequestCounter');
      this.notify.success(`Sent invitation to ${request.email}`);
    } catch (err) {
      this.notify.error(parseError(err));
    }
  })
  approveRequest;

  @task(function* (request) {
    try {
      yield request.updateStatus('rejected');
      this.realtime.incrementProperty('RegistrationRequestCounter');
      this.notify.success(`Rejected ${request.email}'s request`);
    } catch (err) {
      this.notify.error(parseError(err));
    }
  })
  rejectRequest;
}
