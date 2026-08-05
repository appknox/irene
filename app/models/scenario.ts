import Model, { AsyncBelongsTo, attr, belongsTo } from '@ember-data/model';
import type ProjectModel from './project';
import type UserModel from './user';
import type { ScenarioUpdateBody } from 'irene/adapters/scenario';

export enum ScenarioType {
  LOGIN = 0,
  OTHER = 1,
}

export default class ScenarioModel extends Model {
  @attr('string')
  declare name: string;

  @attr('string', { defaultValue: '' })
  declare description: string;

  @attr('boolean')
  declare isActive: boolean;

  @attr('boolean')
  declare scenarioDeleted: boolean;

  @attr('number', { defaultValue: ScenarioType.OTHER })
  declare type: ScenarioType;

  @attr('date')
  declare createdOn: Date;

  @attr('date')
  declare updatedOn: Date;

  @belongsTo('project', { async: true, inverse: null })
  declare project: AsyncBelongsTo<ProjectModel>;

  @belongsTo('user', { async: true, inverse: null })
  declare lastUpdatedBy: AsyncBelongsTo<UserModel> | null;

  get isLoginType() {
    return this.type === ScenarioType.LOGIN;
  }

  get isOtherType() {
    return this.type === ScenarioType.OTHER;
  }

  async updateScenario(
    projectId: string | number,
    payload: ScenarioUpdateBody
  ) {
    const adapter = this.store.adapterFor('scenario');

    return adapter.updateScenario(projectId, this.id, payload);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    scenario: ScenarioModel;
  }
}
