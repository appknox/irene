import { AsyncBelongsTo, attr, belongsTo } from '@ember-data/model';

import ENUMS from 'irene/enums';
import SkAppModel from './sk-app';
import type ProjectModel from './project';
import type FileModel from './file';
import type SubmissionModel from './submission';

export default class SkInventoryAppModel extends SkAppModel {
  @attr('boolean')
  declare canInitiateUpload: boolean;

  @attr('string')
  declare submissionErrorHeader: string;

  @attr('string')
  declare submissionErrorMessage: string;

  @attr('date')
  declare lastMonitoredOn: Date;

  @belongsTo('project', { async: true, inverse: null })
  declare coreProject: AsyncBelongsTo<ProjectModel> | null;

  @belongsTo('file', { async: true, inverse: null })
  declare coreProjectLatestVersion: AsyncBelongsTo<FileModel> | null;

  @belongsTo('submission', { async: true, inverse: null })
  declare uploadSubmission: AsyncBelongsTo<SubmissionModel> | null;

  get appIsNotAvailableOnAppknox() {
    return !this.coreProject?.get('id');
  }

  get containsUnscannedVersion() {
    return (
      this.storeMonitoringStatus ===
      ENUMS.SK_APP_MONITORING_STATUS.ACTION_NEEDED
    );
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sk-inventory-app': SkInventoryAppModel;
  }
}
