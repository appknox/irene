import Model, { attr, belongsTo, type AsyncBelongsTo } from '@ember-data/model';
import type VulnerabilityModel from 'irene/models/vulnerability';

export default class AnalyticsRecentIssueModel extends Model {
  @attr('number')
  declare count: number;

  @belongsTo('vulnerability', { async: true, inverse: null })
  declare vulnerability: AsyncBelongsTo<VulnerabilityModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'analytics/recent-issue': AnalyticsRecentIssueModel;
  }
}
