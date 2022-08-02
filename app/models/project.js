/* eslint-disable ember/no-computed-properties-in-native-classes */
/* eslint-disable ember/no-mixins */
import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { alias } from '@ember/object/computed';
import { isEmpty } from '@ember/utils';
import ENUMS from 'irene/enums';
import { ModelBaseMixin } from 'irene/mixins/base-model';

export default class ProjectModel extends ModelBaseMixin(Model) {
  @attr('string') name;
  @attr('string') packageName;
  @attr('string') githubRepo;
  @attr('string') jiraProject;
  @attr('string') testUser;
  @attr('string') testPassword;
  @attr('string') url;
  @attr('number') activeProfileId;
  @attr('number') platform;
  @attr('number') source;
  @attr('number') fileCount;
  @attr('date') lastFileCreatedOn;

  @belongsTo('user', { inverse: 'ownedProjects' }) owner;
  @belongsTo('file') lastFileId;
  @hasMany('file', { inverse: 'project' }) files;

  get pdfPassword() {
    const uuid = this.uuid;
    if (isEmpty(uuid)) {
      return 'Unknown!';
    } else {
      return uuid.split('-')[4];
    }
  }

  get hasFiles() {
    return this.fileCount > 0;
  }

  get hasMultipleFiles() {
    return this.fileCount > 1;
  }

  get platformDisplay() {
    switch (this.platform) {
      case ENUMS.PLATFORM.ANDROID:
        return 'Android';
      case ENUMS.PLATFORM.IOS:
        return 'iOS';
      case ENUMS.PLATFORM.WINDOWS:
        return 'Windows';
      default:
        return '';
    }
  }

  get platformIconClass() {
    switch (this.platform) {
      case ENUMS.PLATFORM.ANDROID:
        return 'android';
      case ENUMS.PLATFORM.IOS:
        return 'apple';
      case ENUMS.PLATFORM.WINDOWS:
        return 'windows';
      default:
        return 'mobile';
    }
  }

  get isAPIScanEnabled() {
    const platform = this.platform;
    return [ENUMS.PLATFORM.ANDROID, ENUMS.PLATFORM.IOS].includes(platform);
  }

  @alias('lastFileId') lastFile;
}
