import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject } from '@ember/service';
import { task } from 'ember-concurrency';
import parseError from 'irene/utils/parse-error';

export default class PartnerRegistrationRequestRejectedComponent extends Component {
  @inject realtime;
  @inject('notifications') notify;

  @tracked request;

  @task(function* (request) {
    try {
      yield request.updateStatus('pending');
      this.realtime.incrementProperty('RegistrationRequestCounter');
      this.notify.success(`Restored ${request.email}'s request to pending`);
    } catch (err) {
      this.notify.error(parseError(err));
    }
  })
  undoReject;
}
