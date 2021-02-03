import Model, {
  attr
} from '@ember-data/model';
import {
  computed
} from '@ember/object';

export default class ClientUploadModel extends Model {

  @attr('string') name;
  @attr('date') createdOn;
  @attr('string') iconUrl;
  @attr('string') version;
  @attr() project;

  @computed('project.platform')
  get platformIcon() {
    return this.project.platform === 'ios' ? 'apple' : 'android';
  }
}
