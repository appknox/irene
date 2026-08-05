import { hasMany, SyncHasMany } from '@ember-data/model';

import ScenarioModel from './scenario';
import type ScenarioUserRoleModel from './scenario-user-role';
import type ScenarioStepModel from './scenario-step';

import type {
  RoleBulkCreateBody,
  RoleStepsBulkUpdateBody,
  ScenarioBulkUpdateStepsBody,
  ScenarioRolePayload,
} from 'irene/adapters/scenario-detail';

export default class ScenarioDetailModel extends ScenarioModel {
  @hasMany('scenario-user-role', { async: false, inverse: null })
  declare roles: SyncHasMany<ScenarioUserRoleModel>;

  @hasMany('scenario-step', { async: false, inverse: null })
  declare steps: SyncHasMany<ScenarioStepModel>;

  get adapter() {
    return this.store.adapterFor('scenario-detail');
  }

  // Create a single role (Login scenarios only).
  async createRole(projectId: string | number, payload: ScenarioRolePayload) {
    return this.adapter.createRole(projectId, this.id, payload);
  }

  // Bulk-create roles (Login scenarios only).
  async bulkCreateRoles(
    projectId: string | number,
    payload: RoleBulkCreateBody
  ) {
    return this.adapter.bulkCreateRoles(projectId, this.id, payload);
  }

  // Delete a role (Login scenarios only).
  async deleteRole(projectId: string | number, roleId: string | number) {
    return this.adapter.deleteRole(projectId, this.id, roleId);
  }

  // Rename an existing role.
  async updateRole(
    projectId: string | number,
    roleId: string | number,
    payload: ScenarioRolePayload
  ) {
    return this.adapter.updateRole(projectId, this.id, roleId, payload);
  }

  // Bulk-update steps for a single role (Login scenarios only).
  async bulkUpdateRoleSteps(
    projectId: string | number,
    roleId: string | number,
    payload: RoleStepsBulkUpdateBody
  ) {
    const args = [projectId, this.id, roleId, payload] as const;

    return this.adapter.bulkUpdateRoleSteps(...args);
  }

  // Bulk-update steps at the scenario level (Other scenarios).
  async bulkUpdateSteps(
    projectId: string | number,
    payload: ScenarioBulkUpdateStepsBody
  ) {
    return this.adapter.bulkUpdateSteps(projectId, this.id, payload);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'scenario-detail': ScenarioDetailModel;
  }
}
