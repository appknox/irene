import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type Store from 'ember-data/store';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type { DS } from 'ember-data';

import ENV from 'irene/config/environment';
import { ENUMS_DISPLAY } from 'irene/enums';
import type SbomComponentModel from 'irene/models/sbom-component';
import type SbomFileModel from 'irene/models/sbom-file';

type SbomComponentListArray =
  DS.AdapterPopulatedRecordArray<SbomComponentModel> & {
    meta: { count: number };
  };

export default class SbomScanDetailsService extends Service {
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked
  sbomComponentList?: DS.AdapterPopulatedRecordArray<SbomComponentModel>;

  @tracked limit = 25;
  @tracked offset = 0;
  @tracked viewType: 'list' | 'tree' = 'tree';
  @tracked searchQuery: string = '';
  @tracked selectedDependencyType: boolean | null = null;
  @tracked selectedComponentType = -1;
  @tracked isAiComponentFilter: boolean | null = null;
  @tracked selectedAiArtifactClass: string | null = null;
  @tracked selectedAiConfidence: string | null = null;
  @tracked ordering: string | null = null;
  @tracked sbomComponentsCount = 0;
  @tracked sbomFile: SbomFileModel | null = null;

  get isFetchingSbomComponentList() {
    return this.fetch.isRunning;
  }

  setLimitOffset({
    limit,
    offset,
  }: Partial<{ limit: number; offset: number }>) {
    this.limit = limit ?? this.limit;
    this.offset = offset ?? this.offset;

    return this;
  }

  setQueryData({
    component_query,
    component_type,
    dependency_type,
    view_type,
    sbomFile,
    is_ai_component,
    ai_artifact_class,
    ai_confidence,
    ordering,
  }: Partial<{
    sbomFile: SbomFileModel | null;
    component_query: string;
    component_type: number;
    dependency_type: string | null;
    view_type: 'tree' | 'list';
    is_ai_component: string | null;
    ai_artifact_class: string | null;
    ai_confidence: string | null;
    ordering: string | null;
  }>) {
    // Deliberately skip the assignment (rather than reading `this.<prop>`
    // back as a same-value fallback) when a key is omitted. Reading a
    // tracked property and immediately writing it back — even to the same
    // value — still counts as a write for autotracking, and triggers
    // Ember's "updated after being used in the same computation" assertion
    // if this runs during a render (e.g. from a component constructor, as
    // happened here: SbomScanDetailsComponent's constructor calls this
    // without every key, and the omitted ones took the self-read branch).
    if (sbomFile !== undefined) this.sbomFile = sbomFile;
    if (view_type !== undefined) this.viewType = view_type;
    if (component_query !== undefined) this.searchQuery = component_query;
    if (component_type !== undefined) this.selectedComponentType = component_type;

    if (dependency_type !== undefined) {
      this.selectedDependencyType =
        dependency_type === null ? null : dependency_type === 'true';
    }

    if (is_ai_component !== undefined) {
      this.isAiComponentFilter =
        is_ai_component === null ? null : is_ai_component === 'true';
    }

    if (ai_artifact_class !== undefined) {
      this.selectedAiArtifactClass = ai_artifact_class;
    }

    if (ai_confidence !== undefined) {
      this.selectedAiConfidence = ai_confidence;
    }

    if (ordering !== undefined) {
      this.ordering = ordering;
    }

    return this;
  }

  async reload() {
    await this.fetch.perform();
  }

  fetch = task({ keepLatest: true }, async () => {
    const searchQuery = this.searchQuery?.trim();

    // List view specific queries
    const listQueries = {
      ...(searchQuery ? { q: searchQuery } : {}),

      ...(this.selectedDependencyType !== null
        ? { is_dependency: this.selectedDependencyType }
        : {}),

      ...(this.selectedComponentType > -1
        ? {
            component_type:
              ENUMS_DISPLAY.SBOM_COMPONENT_TYPE_NAMES[
                this.selectedComponentType
              ],
          }
        : {}),

      ...(this.isAiComponentFilter !== null
        ? { is_ai_component: this.isAiComponentFilter }
        : {}),

      ...(this.selectedAiArtifactClass
        ? { ai_artifact_class: this.selectedAiArtifactClass }
        : {}),

      ...(this.selectedAiConfidence
        ? { ai_confidence: this.selectedAiConfidence }
        : {}),

      ...(this.ordering ? { ordering: this.ordering } : {}),
    };

    // Query Params
    const queryParams = {
      limit: this.limit,
      offset: this.offset,
      sbomFileId: this.sbomFile?.id,
      ...(this.viewType === 'tree' ? { type: 1 } : listQueries),
    };

    try {
      const sbomComponentList = (await this.store.query(
        'sbom-component',
        queryParams
      )) as SbomComponentListArray;

      this.sbomComponentList = sbomComponentList;
      this.sbomComponentsCount = sbomComponentList.meta.count;
    } catch (error) {
      this.notify.error(
        'Failed to load SBOM components. Please try again later.',
        ENV.notifications
      );
    }
  });
}
