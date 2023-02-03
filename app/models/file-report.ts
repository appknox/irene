/* eslint-disable ember/no-computed-properties-in-native-classes */
import Model, { attr } from '@ember-data/model';
import { computed } from '@ember/object';

export default class FileReportModel extends Model {
  @attr('date')
  declare generatedOn: Date;

  @attr('string')
  declare language: string;

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

  @computed('progress')
  get isGenerated() {
    return this.progress === 100;
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'file-report': FileReportModel;
  }
}
