import Model, { attr, belongsTo } from '@ember-data/model';
import VulnerabilityModel from 'irene/models/vulnerability';

export default class AnalyticsRecentIssueModel extends Model {
  @attr('number')
  declare count: number;

  @belongsTo('vulnerability')
  declare vulnerability: VulnerabilityModel;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'analytics/recent-issue': AnalyticsRecentIssueModel;
  }
}
