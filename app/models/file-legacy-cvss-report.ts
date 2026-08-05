import dayjs from 'dayjs';
import Model, { attr } from '@ember-data/model';
import { isEmpty } from '@ember/utils';

import type { FileReportScanType } from 'irene/models/file-report';

export type FileLegacyCvssReportModelName = 'file-legacy-cvss-report';

export default class FileLegacyCvssReportModel extends Model {
  @attr('date')
  declare generatedOn: Date;

  @attr('string')
  declare language: 'en' | 'ja';

  @attr('string')
  declare format: string;

  @attr('number')
  declare progress: number;

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
    const adapter = this.store.adapterFor('file-legacy-cvss-report');

    return adapter.getReportByType('file-legacy-cvss-report', this.id, type);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'file-legacy-cvss-report': FileLegacyCvssReportModel;
  }
}
