import Model, { AsyncBelongsTo, belongsTo, attr } from '@ember-data/model';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type FileModel from './file';
import type ProjectModel from './project';

export enum SbomScanStatus {
  IN_PROGRESS = 0,
  COMPLETED = 1,
}

export default class PrivacyProjectModel extends Model {
  @service declare intl: IntlService;

  @belongsTo('file', { async: true, inverse: null })
  declare latestFile: AsyncBelongsTo<FileModel>;

  @belongsTo('project', { async: true, inverse: null })
  declare project: AsyncBelongsTo<ProjectModel>;

  @attr('number')
  declare latestFilePrivacyAnalysisStatus: number;

  get statusValue() {
    switch (this.latestFilePrivacyAnalysisStatus) {
      case SbomScanStatus.IN_PROGRESS:
        return this.intl.t('chipStatus.inProgress');

      case SbomScanStatus.COMPLETED:
        return this.intl.t('chipStatus.completed');

      default:
        return this.intl.t('chipStatus.inProgress');
    }
  }

  get statusColor() {
    switch (this.latestFilePrivacyAnalysisStatus) {
      case SbomScanStatus.IN_PROGRESS:
        return 'warn';

      case SbomScanStatus.COMPLETED:
        return 'success';

      default:
        return 'warn';
    }
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'privacy-project': PrivacyProjectModel;
  }
}
