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

export default class ClientModel extends Model {


  @attr('boolean') isTrail;
  @attr('date') lastUpload;
  @attr('string') logo;
  @attr('number') creditsLeft;
  @attr('boolean') isPerScan;
  @attr('string') name;
  @attr('number') totalUserCount;
  @attr('number') totalFileUploadCount;
  @attr('number') totalProjectCount

  @equal('isPerScan', false) isPerApp;
  @reads('name') company;

  @computed('name')
  get thumbnail() {
    return this.name.charAt(0);
  }
}
