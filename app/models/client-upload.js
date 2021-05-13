import Model, {
  attr
} from '@ember-data/model';
import {
  computed
} from '@ember/object';
import {
  htmlSafe
} from '@ember/template';

export default class ClientUploadModel extends Model {

  @attr('string') name;
  @attr('date') createdOn;
  @attr('string') iconUrl;
  @attr('string') version;
  @attr() project;
  @attr('string') versionCode;

  @computed('project.platform')
  get platformIcon() {
    return this.project.platform === 'Android' ? 'android' : 'apple';
  }

  @computed('iconUrl')
  get iconHtmlUrl() {
    return htmlSafe(`background-image: url(${this.iconUrl})`);
  }
}
