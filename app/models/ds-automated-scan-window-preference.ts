import Model, { attr } from '@ember-data/model';

export type DsAutomatedScanWindowType = 'anytime' | 'specific_time';

export default class DsAutomatedScanWindowPreferenceModel extends Model {
  @attr('string')
  declare scanWindowType: DsAutomatedScanWindowType;

  // `HH:MM` strings; null when `scanWindowType === 'anytime'`.
  @attr('string')
  declare scanWindowStartAt: string | null;

  @attr('string')
  declare scanWindowEndBefore: string | null;

  // IANA timezone (e.g. `Asia/Kolkata`). Empty string when `anytime`.
  @attr('string')
  declare scanWindowTimezone: string;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'ds-automated-scan-window-preference': DsAutomatedScanWindowPreferenceModel;
  }
}
