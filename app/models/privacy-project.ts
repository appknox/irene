import Model, { AsyncBelongsTo, belongsTo, attr } from '@ember-data/model';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import type FileModel from './file';
import type ProjectModel from './project';

export default class PrivacyProjectModel extends Model {
  @service declare intl: IntlService;

  @belongsTo('file', { async: true, inverse: null })
  declare latestFile: AsyncBelongsTo<FileModel>;

  @belongsTo('project', { async: true, inverse: null })
  declare project: AsyncBelongsTo<ProjectModel>;

  @attr('number')
  declare latestFilePrivacyAnalysisStatus: number;

  @attr('boolean')
  declare highlight: boolean;

  @attr('boolean')
  declare pii_highlight: boolean;

  @attr('date')
  declare lastScannedOn: Date;

  get statusValue() {
    switch (this.latestFilePrivacyAnalysisStatus) {
      case ENUMS.PM_STATUS.IN_PROGRESS:
        return this.intl.t('chipStatus.inProgress');

      case ENUMS.PM_STATUS.COMPLETED:
        return this.intl.t('chipStatus.completed');

      case ENUMS.PM_STATUS.FAILED:
        return this.intl.t('chipStatus.failed');

      default:
        return this.intl.t('chipStatus.inProgress');
    }
  }

  get statusColor() {
    switch (this.latestFilePrivacyAnalysisStatus) {
      case ENUMS.PM_STATUS.IN_PROGRESS:
        return 'warn';

      case ENUMS.PM_STATUS.COMPLETED:
        return 'success';

      case ENUMS.PM_STATUS.FAILED:
        return 'error';

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
