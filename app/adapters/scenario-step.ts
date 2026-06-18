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

    if (id) {
      return `${stepsURL}/${encodeURIComponent(id)}`;
    }

    return stepsURL;
  }

  private _stepURL(
    projectId: ModelOrRelationID,
    scenarioId: ModelOrRelationID,
    stepId: ModelOrRelationID
  ) {
    return `${this._buildNestedURL(projectId, scenarioId)}/${encodeURIComponent(stepId)}`;
  }

  // ── Push helpers ─────────────────────────────────────────────────────────

  private pushStep(step: ScenarioStepResponse) {
    this.store.push(this.store.normalize('scenario-step', step));
  }

  // ── Custom endpoints ──────────────────────────────────────────────────────
  // Endpoint 9: partial step update — used for masking/unmasking a value via
  // the `is_secure` flag without going through a bulk save.
  async maskStep(
    projectId: ModelOrRelationID,
    scenarioId: ModelOrRelationID,
    stepId: ModelOrRelationID,
    isSecure: boolean
  ): Promise<ScenarioStepResponse> {
    const url = this._stepURL(projectId, scenarioId, stepId);
    const payload = { is_secure: isSecure };
    const response = await this.ajax(url, 'PATCH', { data: payload });

    this.pushStep(response as ScenarioStepResponse);

    return response;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'scenario-step': ScenarioStepAdapter;
  }
}
