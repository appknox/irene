import type { AsyncBelongsTo } from '@ember-data/model';
import Model, { attr, belongsTo } from '@ember-data/model';
import type ScenarioUserRoleModel from './scenario-user-role';

export enum ScenarioStepAction {
  TAP = 0,
  LONG_PRESS = 1,
  ENTER_TEXT = 2,
  SELECT = 3,
  CHECK = 4,
  SWIPE = 5,
  DRAG = 6,
  WAIT = 7,
  ENTER_OTP = 8,
}

export type OtpSource = 'app' | 'authenticator_key';

/** Per-action extras; only Enter OTP uses it today. Unknown keys are kept as-is. */
export interface ScenarioStepMetadata {
  source?: OtpSource;
  note?: string;
  [key: string]: unknown;
}

export default class ScenarioStepModel extends Model {
  @attr('number')
  declare order: number;

  @attr('number')
  declare action: ScenarioStepAction;

  @attr('string')
  declare identifier: string;

  @attr('string')
  declare value: string;

  @attr('boolean', { defaultValue: false })
  declare isSecure: boolean;

  @attr({ defaultValue: () => ({}) })
  declare metadata: ScenarioStepMetadata;

  @belongsTo('scenario-user-role', { async: true, inverse: null })
  declare role: AsyncBelongsTo<ScenarioUserRoleModel>;

  async maskStep(projectId: string, scenarioId: string, isSecure: boolean) {
    const adapter = this.store.adapterFor('scenario-step');

    return adapter.maskStep(projectId, scenarioId, this.id, isSecure);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'scenario-step': ScenarioStepModel;
  }
}
