import Model, { attr } from '@ember-data/model';

interface UploadTimelineItem {
  created_on_date: string;
  upload_count: number;
}

export default class PartnerPartnerclientAnalyticModel extends Model {
  @attr()
  declare uploadTimeline: UploadTimelineItem[];
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'partner/partnerclient-analytic': PartnerPartnerclientAnalyticModel;
  }
}
