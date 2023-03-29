import Model, {
  attr,
  belongsTo,
  hasMany,
  AsyncBelongsTo,
  AsyncHasMany,
} from '@ember-data/model';

import AmAppSyncModel from './am-app-sync';
import AmAppVersionModel from './am-app-version';
import AMConfigurationModel from './amconfiguration';
import ProjectModel from './project';

export default class AmAppModel extends Model {
  @attr('boolean')
  declare automatedUpload: boolean;

  @attr('boolean')
  declare monitoringEnabled: boolean;

  @attr('boolean')
  declare isActive: boolean;

  @belongsTo('amconfiguration')
  declare amConfiguration: AsyncBelongsTo<AMConfigurationModel>;

  @belongsTo('project')
  declare project: AsyncBelongsTo<ProjectModel>;

  @belongsTo('am-app-sync', { inverse: null })
  declare lastSync: AsyncBelongsTo<AmAppSyncModel>;

  @belongsTo('am-app-version', { inverse: null })
  declare latestAmAppVersion: AsyncBelongsTo<AmAppVersionModel>;

  @belongsTo('am-app-version', { inverse: null })
  declare relevantAmAppVersion: AsyncBelongsTo<AmAppVersionModel>;

  @hasMany('am-app-sync')
  declare amAppSyncs: AsyncHasMany<AmAppSyncModel>;

  @hasMany('am-app-version')
  declare amAppVersions: AsyncHasMany<AmAppVersionModel>;

  get isPending() {
    return !this.lastSync.get('id');
  }

  get hasRelevantAmAppVersion() {
    return !!this.relevantAmAppVersion.get('id');
  }

  get isNotFound() {
    if (this.isPending) {
      return false;
    }

    return !this.hasRelevantAmAppVersion || false;
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'am-app': AmAppModel;
  }
}
