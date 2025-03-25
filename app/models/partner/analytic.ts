import Model, { attr } from '@ember-data/model';

export interface PartnerAnalyticUploadTimelineData {
  created_on_date: string;
  upload_count: number;
}

export default class PartnerAnalyticModel extends Model {
  @attr()
  declare uploadTimeline: PartnerAnalyticUploadTimelineData[];
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'partner/analytic': PartnerAnalyticModel;
  }
}
