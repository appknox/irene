import Model, { type AsyncBelongsTo, attr, belongsTo } from '@ember-data/model';
import { isEmpty } from '@ember/utils';
import dayjs from 'dayjs';
import { service } from '@ember/service';

import ENUMS from 'irene/enums';
import type AnalyticsService from 'irene/services/analytics';
import type FileModel from './file';

export type FileCapiReportScanType = 'json' | 'har';
export type FileCapiReportModelName = 'file-capi-report';

export default class FileCapiReportModel extends Model {
  @service declare analytics: AnalyticsService;

  @attr('date')
  declare generatedOn: Date;

  @attr('string')
  declare fileType: 'json' | 'har';

  @attr('number')
  declare progress: IntRange<0, 101>;

  @attr('number')
  declare status: number;

  @attr('date')
  declare createdOn: Date;

  @attr('boolean')
  declare isOutdated: boolean;

  @belongsTo('file', { async: true, inverse: null })
  declare file: AsyncBelongsTo<FileModel>;

  get isGenerated() {
    return this.status === ENUMS.FILE_CAPI_REPORT_STATUS.COMPLETED;
  }

  get reportGenerationFailed() {
    return this.status === ENUMS.FILE_CAPI_REPORT_STATUS.FAILED;
  }

  get isGenerating() {
    return [
      ENUMS.FILE_CAPI_REPORT_STATUS.STARTED,
      ENUMS.FILE_CAPI_REPORT_STATUS.IN_PROGRESS,
    ].includes(this.status);
  }

  get generatedOnDateTime() {
    const createdOn = this.generatedOn;

    if (isEmpty(createdOn)) {
      return '';
    }

    return dayjs(createdOn).format('D MMMM YYYY h:mm A');
  }

  get createdOnDateTime() {
    const createdOn = this.createdOn;

    if (isEmpty(createdOn)) {
      return '';
    }

    return dayjs(createdOn).format('D MMMM YYYY h:mm A');
  }

  downloadReport() {
    this.analytics.track({
      name: 'CAPI_REPORT_DOWNLOAD_EVENT',
      properties: {
        feature: 'captured_api_report',
      },
    });

    const adapter = this.store.adapterFor('file-capi-report');

    return adapter.downloadReport(this.id);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'file-capi-report': FileCapiReportModel;
  }
}
