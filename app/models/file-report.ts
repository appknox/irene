import Model, { attr } from '@ember-data/model';
import { isEmpty } from '@ember/utils';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import ENV from 'irene/config/environment';
import dayjs from 'dayjs';

export type FileReportScanType = 'pdf' | 'xlsx' | 'csv';
export type FileReportModelName = 'file-report';

export default class FileReportModel extends Model {
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
    const analyticsData = ENV.csb['reportDownload'] as CsbAnalyticsFeatureData;
    triggerAnalytics('feature', analyticsData);

    const adapter = this.store.adapterFor('file-report');

    return adapter.getReportByType('file-report', this.id, type);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'file-report': FileReportModel;
  }
}
