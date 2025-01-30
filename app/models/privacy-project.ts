import Model, { AsyncBelongsTo, belongsTo, attr } from '@ember-data/model';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type FileModel from './file';
import type ProjectModel from './project';

export enum PrivacyStatus {
  IN_PROGRESS = 0,
  COMPLETED = 1,
  FAILED = 2,
  PARTIAL_SUCCESS = 3,
}

export default class PrivacyProjectModel extends Model {
  @service declare intl: IntlService;

  @belongsTo('file', { async: true, inverse: null })
  declare latestFile: AsyncBelongsTo<FileModel>;

  @belongsTo('project', { async: true, inverse: null })
  declare project: AsyncBelongsTo<ProjectModel>;

  @attr('number')
  declare latestFilePrivacyAnalysisStatus: PrivacyStatus;

  @attr('date')
  declare lastScannedOn: Date;

  get statusValue() {
    switch (this.latestFilePrivacyAnalysisStatus) {
      case PrivacyStatus.IN_PROGRESS:
        return this.intl.t('chipStatus.inProgress');

      case PrivacyStatus.COMPLETED:
        return this.intl.t('chipStatus.completed');

      case PrivacyStatus.FAILED:
        return this.intl.t('chipStatus.failed');

      case PrivacyStatus.PARTIAL_SUCCESS:
        return this.intl.t('chipStatus.failed');
    }
  }

  get statusColor() {
    switch (this.latestFilePrivacyAnalysisStatus) {
      case PrivacyStatus.IN_PROGRESS:
        return 'warn';

      case PrivacyStatus.COMPLETED:
        return 'success';

      case PrivacyStatus.FAILED:
        return 'error';

      case PrivacyStatus.PARTIAL_SUCCESS:
        return 'error';
    }
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'privacy-project': PrivacyProjectModel;
  }
}
