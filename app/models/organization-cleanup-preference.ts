import Model, { attr } from '@ember-data/model';

export default class OrgCleanupPreferenceModel extends Model {
  @attr('boolean')
  declare isEnabled: boolean;

  @attr('number')
  declare filesToKeep: number;

  @attr('date')
  declare lastCleanedAt: Date;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'organization-cleanup-preference': OrgCleanupPreferenceModel;
  }
}
