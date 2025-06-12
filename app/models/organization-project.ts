/* eslint-disable ember/no-computed-properties-in-native-classes */
import { computed } from '@ember/object';
import Model, {
  attr,
  hasMany,
  AsyncHasMany,
  belongsTo,
  AsyncBelongsTo,
} from '@ember-data/model';
import ENUMS from 'irene/enums';

import OrganizationModel from './organization';
import FileModel from './file';

export type AddProjectData = { write: boolean };
export type OrganizationProjectModelName = 'organization-project';

export default class OrganizationProjectModel extends Model {
  private modelName =
    OrganizationProjectModel.modelName as OrganizationProjectModelName;

  @attr('number')
  declare activeProfileId: number;

  @belongsTo('organization', { async: true, inverse: null })
  declare organization: AsyncBelongsTo<OrganizationModel>;

  @hasMany('file', { inverse: 'project', async: true })
  declare files: AsyncHasMany<FileModel>;

  @attr('string')
  declare name: string;

  @attr('string')
  declare packageName: string;

  @attr('number')
  declare platform: number;

  @attr('number')
  declare source: number;

  @attr('string')
  declare githubRepo: string;

  @attr('string')
  declare jiraProject: string;

  @attr('string')
  declare url: string;

  @attr('date')
  declare lastFileCreatedOn: Date;

  @attr('number')
  declare fileCount: number;

  @computed('fileCount', 'id', 'store')
  get lastFile() {
    const params = {
      projectId: this.id,
      lastFileOnly: true,
    };

    return this.store.queryRecord('file', params);
  }

  @computed('fileCount')
  get hasMultipleFiles() {
    return this.fileCount > 1;
  }

  @computed('platform')
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

  addCollaborator(data: AddProjectData, id: string) {
    const adapter = this.store.adapterFor(this.modelName);

    return adapter.addCollaborator(this.store, this.modelName, this, data, id);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'organization-project': OrganizationProjectModel;
  }
}
