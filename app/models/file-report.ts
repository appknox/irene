import dayjs from 'dayjs';
import Model, { attr } from '@ember-data/model';
import { service } from '@ember/service';
import { isEmpty } from '@ember/utils';

import type AnalyticsService from 'irene/services/analytics';

export type FileReportScanType = 'pdf' | 'xlsx' | 'csv';
export type FileReportModelName = 'file-report';

export default class FileReportModel extends Model {
  @service declare analytics: AnalyticsService;

  @attr('date')
  declare generatedOn: Date;

  @attr('string')
  declare language: 'en' | 'ja';

  @attr('string')
  declare format: string;

  @attr('number')
  declare progress: IntRange<0, 101>;

  @attr()
  declare preferences: unknown;

  @attr('string')
  declare rating: string;

  @attr('number')
  declare fileId: number;

  get isGenerating() {
    return this.progress >= 0 && this.progress <= 99;
  }

  get isGenerated() {
    return this.progress === 100;
  }

  get generatedOnDateTime() {
    const createdOn = this.generatedOn;

    if (isEmpty(createdOn)) {
      return '';
    }

    return dayjs(createdOn).format('D MMMM YYYY h:mm A');
  }

  getReportByType(type: FileReportScanType) {
    const analyticsData = {
      fileReportId: this.id,
      fileId: this.fileId,
      reportType: type,
    };

    this.analytics.track({
      name: 'FILE_REPORT_DOWNLOAD_EVENT',
      properties: analyticsData,
    });

    const adapter = this.store.adapterFor('file-report');

    return adapter.getReportByType('file-report', this.id, type);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'file-report': FileReportModel;
  }
}
