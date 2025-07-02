import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type Store from '@ember-data/store';

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
  }: Partial<{
    sbomFile: SbomFileModel | null;
    component_query: string;
    component_type: number;
    dependency_type: string | null;
    view_type: 'tree' | 'list';
  }>) {
    this.sbomFile = sbomFile ?? this.sbomFile;
    this.viewType = view_type ?? this.viewType;
    this.searchQuery = component_query ?? this.searchQuery;
    this.selectedComponentType = component_type ?? this.selectedComponentType;

    this.selectedDependencyType =
      dependency_type === undefined
        ? this.selectedDependencyType
        : dependency_type === null
          ? null
          : dependency_type === 'true';

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
