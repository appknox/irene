import commondrf from './commondrf';
import type { Snapshot } from '@ember-data/store';
import type ModelRegistry from 'ember-data/types/registries/model';

// ─── Shared payload / response shapes ────────────────────────────────────────
type ModelOrRelationID = string | number;

export interface ScenarioRolePayload {
  name: string;
}

export interface ScenarioDetailResponse {
  id: ModelOrRelationID;
  name: string;
  roles: ScenarioRoleResponse[];
  steps: Array<ScenarioStepPayload & { id: ModelOrRelationID }>;
  [key: string]: unknown;
}

export interface ScenarioRoleResponse {
  id: ModelOrRelationID;
  name: string;
}

/** Step payload for OTHER scenarios — role is always `null`. */
export interface ScenarioStepPayload {
  id?: ModelOrRelationID;
  role: ModelOrRelationID | null;
  order: number;
  action: number;
  identifier: string;
  value: string;
  is_secure: boolean;
}

/** Step payload for the per-role endpoint — role comes from the URL. */
export interface RoleStepPayload {
  id?: ModelOrRelationID;
  order: number;
  action: number;
  identifier: string;
  value: string;
  is_secure: boolean;
}

export interface ScenarioBulkUpdateStepsBody {
  steps: ScenarioStepPayload[];
}

export interface RoleStepsBulkUpdateBody {
  steps: RoleStepPayload[];
}

export interface RoleBulkCreateBody {
  roles: ScenarioRolePayload[];
}

interface ScenarioDetailQuery {
  projectId?: ModelOrRelationID;
  id?: ModelOrRelationID;
}

interface ScenarioDetailReloadOptions {
  projectId?: ModelOrRelationID;
}

// ─── Adapter ─────────────────────────────────────────────────────────────────

export default class ScenarioDetailAdapter extends commondrf {
  namespace = this.namespace_v2;

  // ── URL helpers ───────────────────────────────────────────────────────────

  _buildNestedURL(projectId: ModelOrRelationID, id?: ModelOrRelationID) {
    const projectAdapter = this.store.adapterFor('project');
    const projectURL = projectAdapter._buildURL('project', projectId);

    const scenariosURL = `${projectURL}/scenarios`.replace(
      this.namespace_v3,
      this.namespace_v2
    );

    return id ? `${scenariosURL}/${encodeURIComponent(id)}` : scenariosURL;
  }

  private _roleCollectionURL(
    projectId: ModelOrRelationID,
    scenarioId: ModelOrRelationID
  ) {
    return `${this._buildNestedURL(projectId, scenarioId)}/role`;
  }

  private _roleURL(
    projectId: ModelOrRelationID,
    scenarioId: ModelOrRelationID,
    roleId: ModelOrRelationID
  ) {
    return `${this._buildNestedURL(projectId, scenarioId)}/roles/${encodeURIComponent(roleId)}`;
  }

  private _roleStepsURL(
    projectId: ModelOrRelationID,
    scenarioId: ModelOrRelationID,
    roleId: string | number
  ) {
    return `${this._buildNestedURL(projectId, scenarioId)}/role/${encodeURIComponent(roleId)}/steps/bulk_update`;
  }

  private _scenarioStepsURL(
    projectId: ModelOrRelationID,
    scenarioId: ModelOrRelationID
  ) {
    return `${this._buildNestedURL(projectId, scenarioId)}/steps/bulk_update`;
  }

  // ── Ember Data URL overrides ──────────────────────────────────────────────

  urlForQueryRecord<K extends keyof ModelRegistry>(
    query: ScenarioDetailQuery,
    modelName: K
  ) {
    if (query.projectId && query.id) {
      const { projectId, id } = query;

      delete query.id;
      delete query.projectId;

      return this._buildNestedURL(projectId, id);
    }

    return super.urlForQueryRecord(query, modelName);
  }

  urlForFindRecord<K extends keyof ModelRegistry>(
    id: string,
    modelName: K,
    snapshot: Snapshot<K>
  ) {
    const { projectId } =
      snapshot.adapterOptions as ScenarioDetailReloadOptions;

    if (projectId) {
      return this._buildNestedURL(projectId, id);
    }

    return super.urlForFindRecord(id, modelName, snapshot);
  }

  urlForDeleteRecord<K extends keyof ModelRegistry>(
    id: string,
    _modelName: K,
    snapshot: Snapshot<K>
  ) {
    const { projectId } =
      snapshot.adapterOptions as ScenarioDetailReloadOptions;

    if (projectId) {
      return this._buildNestedURL(projectId, id);
    }

    return super.urlForDeleteRecord(id, _modelName, snapshot);
  }

  // ── Push helpers ─────────────────────────────────────────────────────────

  private pushScenarioDetail(response: ScenarioDetailResponse) {
    this.store.push(this.store.normalize('scenario-detail', response));
  }

  private pushRole(role: ScenarioRoleResponse) {
    this.store.push(this.store.normalize('scenario-user-role', role));
  }

  // ── Custom endpoints ──────────────────────────────────────────────────────

  // Single role create on a Login scenario.
  async createRole(
    projectId: ModelOrRelationID,
    scenarioId: ModelOrRelationID,
    payload: ScenarioRolePayload
  ): Promise<ScenarioRoleResponse> {
    const url = this._roleCollectionURL(projectId, scenarioId);

    const response = await this.ajax(url, 'POST', { data: payload });
    this.pushRole(response as ScenarioRoleResponse);

    return response;
  }

  // Bulk-create roles on a Login scenario.
  async bulkCreateRoles(
    projectId: ModelOrRelationID,
    scenarioId: ModelOrRelationID,
    payload: RoleBulkCreateBody
  ): Promise<ScenarioRoleResponse[]> {
    const url = `${this._roleCollectionURL(projectId, scenarioId)}/bulk_create`;

    const response = await this.ajax(url, 'POST', { data: payload });
    response.forEach((role: ScenarioRoleResponse) => this.pushRole(role));

    return response;
  }

  // Delete a role on a Login scenario.
  async deleteRole(
    projectId: ModelOrRelationID,
    scenarioId: ModelOrRelationID,
    roleId: ModelOrRelationID
  ): Promise<void> {
    const url = this._roleURL(projectId, scenarioId, roleId);

    await this.ajax(url, 'DELETE');
  }

  // Rename a role.
  async updateRole(
    projectId: ModelOrRelationID,
    scenarioId: ModelOrRelationID,
    roleId: ModelOrRelationID,
    payload: ScenarioRolePayload
  ): Promise<ScenarioRoleResponse> {
    const url = this._roleURL(projectId, scenarioId, roleId);
    const response = await this.ajax(url, 'PUT', { data: payload });

    this.pushRole(response as ScenarioRoleResponse);

    return response;
  }

  // Per-role steps bulk update (Login only).
  async bulkUpdateRoleSteps(
    projectId: ModelOrRelationID,
    scenarioId: ModelOrRelationID,
    roleId: ModelOrRelationID,
    payload: RoleStepsBulkUpdateBody
  ): Promise<ScenarioDetailResponse> {
    const url = this._roleStepsURL(projectId, scenarioId, roleId);
    const response = await this.ajax(url, 'PUT', { data: payload });

    this.pushScenarioDetail(response as ScenarioDetailResponse);

    return response;
  }

  // Steps bulk update (Other scenarios).
  async bulkUpdateSteps(
    projectId: ModelOrRelationID,
    scenarioId: ModelOrRelationID,
    payload: ScenarioBulkUpdateStepsBody
  ): Promise<ScenarioDetailResponse> {
    const url = this._scenarioStepsURL(projectId, scenarioId);
    const response = await this.ajax(url, 'PUT', { data: payload });

    this.pushScenarioDetail(response as ScenarioDetailResponse);

    return response;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'scenario-detail': ScenarioDetailAdapter;
  }
}
