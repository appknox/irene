/* eslint-disable ember/no-computed-properties-in-native-classes */
import Model, { attr } from '@ember-data/model';
import { htmlSafe } from '@ember/template';
import { computed } from '@ember/object';

export default class PartnerclientFileModel extends Model {
  @attr('string') name;
  @attr('date') createdOn;
  @attr('string') iconUrl;
  @attr('string') version;
  @attr('string') versionCode;

  @computed('iconUrl')
  get backgroundIconStyle() {
    return htmlSafe(`background-image: url(${this.iconUrl})`);
  }
}
