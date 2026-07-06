import commondrf from './commondrf';

type ModelOrRelationID = string | number;

export interface ScenarioStepResponse {
  id: ModelOrRelationID;
  role: string | number | null;
  order: number;
  action: number;
  identifier: string;
  value: string;
  is_secure: boolean;
}

export default class ScenarioStepAdapter extends commondrf {
  namespace = this.namespace_v2;

  // ── URL helpers ───────────────────────────────────────────────────────────

  _buildNestedURL(
    projectId: ModelOrRelationID,
    scenarioId: ModelOrRelationID,
    id?: ModelOrRelationID
  ) {
    const projectAdapter = this.store.adapterFor('project');
    const projectURL = projectAdapter._buildURL('project', projectId);

    let stepsURL = `${projectURL}/scenarios/${encodeURIComponent(scenarioId)}/steps`;
    stepsURL = stepsURL.replace(this.namespace_v3, this.namespace_v2);

    return id ? `${stepsURL}/${encodeURIComponent(id)}` : stepsURL;
  }

  private _stepURL(
    projectId: ModelOrRelationID,
    scenarioId: ModelOrRelationID,
    stepId: ModelOrRelationID
  ) {
    return `${this._buildNestedURL(projectId, scenarioId)}/${encodeURIComponent(stepId)}`;
  }

  // ── Custom endpoints ──────────────────────────────────────────────────────
  async maskStep(
    projectId: ModelOrRelationID,
    scenarioId: ModelOrRelationID,
    stepId: ModelOrRelationID,
    isSecure: boolean
  ): Promise<ScenarioStepResponse> {
    const url = this._stepURL(projectId, scenarioId, stepId);
    const payload = { is_secure: isSecure };
    const response = await this.ajax(url, 'PATCH', { data: payload });

    const normalized = this.store.normalize('scenario-step', response);
    this.store.push(normalized);

    return response;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'scenario-step': ScenarioStepAdapter;
  }
}
