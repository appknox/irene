/* eslint-disable ember/no-computed-properties-in-native-classes, ember/no-mixins */
import {
  AsyncBelongsTo,
  AsyncHasMany,
  attr,
  belongsTo,
  hasMany,
} from '@ember-data/model';

import ComputedProperty, { alias } from '@ember/object/computed';
import { isEmpty } from '@ember/utils';
import ENUMS from 'irene/enums';
import { ModelBaseMixin } from 'irene/mixins/base-model';

import FileModel from './file';
import UserModel from './user';

export default class ProjectModel extends ModelBaseMixin {
  @attr('string')
  declare name: string;

  @attr('string')
  declare packageName: string;

  @attr('boolean')
  declare isManualScanAvailable: boolean;

  @attr('string')
  declare githubRepo: string;

  @attr('string')
  declare jiraProject: string;

  @attr('string')
  declare testUser: string;

  @attr('string')
  declare testPassword: string;

  @attr('string')
  declare url: string;

  @attr('number')
  declare activeProfileId: number;

  @attr('number')
  declare platform: number;

  @attr('number')
  declare source: number;

  @attr('number')
  declare fileCount: number;

  @attr('date')
  declare lastFileCreatedOn: Date;

  @belongsTo('user', { inverse: 'ownedProjects' })
  declare owner: AsyncBelongsTo<UserModel>;

  @belongsTo('file')
  declare lastFileId: AsyncBelongsTo<FileModel>;

  @alias('lastFileId')
  declare lastFile: ComputedProperty<FileModel>;

  @hasMany('file', { inverse: 'project' })
  declare files: AsyncHasMany<FileModel>;

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
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    project: ProjectModel;
  }
}
