import Model, {
  attr
} from '@ember-data/model';
import {
  computed
} from '@ember/object';
import {
  reads,
  equal
} from '@ember/object/computed';
import {
  isEmpty
} from '@ember/utils';


export default class ClientModel extends Model {


  @attr('boolean') isTrail;
  @attr('date') lastUploadedOn;
  @attr('string') logo;
  @attr('string') name;
  @attr('number') creditsLeft;
  @attr('boolean') isPerScan;
  @attr('number') usersCount;
  @attr('number') fileUploadsCount;
  @attr('number') projectsCount
  @equal('isPerScan', false) isPerApp;
  @reads('name') company;
  @attr('string') ownerEmail;

  @computed('creditsLeft', 'isPerScan')
  get invalidPayment() {
    return this.creditsLeft === null && !this.isPerScan;
  }

  @computed('name')
  get isEmptyTitle() {
    return isEmpty(this.name);
  }
}
