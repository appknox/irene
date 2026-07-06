/* eslint-disable ember/use-ember-data-rfc-395-imports */
import type { Snapshot } from '@ember-data/store';
import type Store from 'ember-data/store';
import type { ModelSchema } from 'ember-data';
import type ModelRegistry from 'ember-data/types/registries/model';

import commondrf from './commondrf';
import type { ScenarioDetailResponse } from './scenario-detail';
import type ScenarioModel from 'irene/models/scenario';

interface ScenarioQuery {
  projectId?: string | number;
  id?: string | number;
}

export interface ScenarioUpdateBody {
  name: string;
  description?: string | null;
  is_active?: boolean;
}

export default class ScenarioAdapter extends commondrf {
  namespace = this.namespace_v2;

  // ── URL helpers ───────────────────────────────────────────────────────────

  _buildNestedURL(projectId: string | number, id?: string | number) {
    const projectAdapter = this.store.adapterFor('project');
    const projectURL = projectAdapter._buildURL('project', projectId);
    let scenariosURL = `${projectURL}/scenarios`;

    scenariosURL = scenariosURL.replace(this.namespace_v3, this.namespace_v2);

    if (id) {
      return `${scenariosURL}/${encodeURIComponent(id)}`;
    }

    return scenariosURL;
  }

  // ── Ember Data URL overrides ──────────────────────────────────────────────
  urlForQuery<K extends string | number>(query: ScenarioQuery, modelName: K) {
    if (query.projectId) {
      const projectId = query.projectId;
      delete query.projectId;

      return this._buildNestedURL(projectId);
    }

    return super.urlForQuery(query, modelName);
  }

  createRecord<K extends keyof ModelRegistry>(
    _: Store,
    _type: ModelSchema<K>,
    snapshot: Snapshot<K>
  ) {
    const { projectId } = snapshot.adapterOptions as { projectId: string };
    const { name, isActive, description } = snapshot.record as ScenarioModel;
    const url = this._buildNestedURL(projectId);

    return this.ajax(url, 'POST', {
      data: { name, is_active: isActive, description },
    });
  }

  // ── Custom endpoints ──────────────────────────────────────────────────────

  async updateScenario(
    projectId: string | number,
    scenarioId: string | number,
    payload: Partial<ScenarioUpdateBody>
  ): Promise<ScenarioDetailResponse> {
    const url = this._buildNestedURL(projectId, scenarioId);
    const response = await this.ajax(url, 'PUT', { data: payload });

    const normalized = this.store.normalize('scenario-detail', response);
    this.store.push(normalized);

    return response;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    scenario: ScenarioAdapter;
  }
}
