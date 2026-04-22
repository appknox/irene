import Model, { attr } from '@ember-data/model';

/** Detail payload from `GET …/store-release-readiness/findings/:id/`. */
export default class StoreReleaseReadinessFindingModel extends Model {
  /** Present when the API includes the parent scan id (field name may vary; map via serializer if needed). */
  @attr('number')
  declare scanId: number | null | undefined;

  @attr('string')
  declare checkId: string;

  @attr('string')
  declare title: string;

  @attr('string')
  declare category: string;

  @attr('number')
  declare severity: number;

  @attr()
  declare passed: boolean | null;

  @attr('string')
  declare evidence: string;

  @attr()
  declare remediationSteps: string[] | undefined;

  @attr('string')
  declare guidelineReference: string;

  @attr('string')
  declare explanation: string;

  @attr('string')
  declare source: string;

  @attr('string')
  declare fieldChecked: string;

  @attr('string')
  declare expected: string;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'store-release-readiness-finding': StoreReleaseReadinessFindingModel;
  }
}
