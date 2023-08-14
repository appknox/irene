import Route from '@ember/routing/route';
import { debug } from '@ember/debug';
import { inject as service } from '@ember/service';
import Store from '@ember-data/store';

import FileModel from 'irene/models/file';
import {
  FileCompareFilterKey,
  FileComparisonItem,
} from 'irene/utils/compare-files';

interface CompareRouteModel {
  file: FileModel;
  fileOld: FileModel;
}

export interface CompareChildrenRoutesModel {
  comparisonFilterKey: FileCompareFilterKey;
  filteredComparisons: FileComparisonItem[];
  files: [file1: FileModel | null, file2: FileModel | null];
}

export interface CompareRouteQueryParams {
  files: string;
}

export default class AuthenticatedDashboardCompareRoute extends Route {
  @service declare store: Store;

  async model(params: CompareRouteQueryParams): Promise<CompareRouteModel> {
    const files = params.files.split('...');
    const [file1Id, file2Id] = files;

    debug(`Comparing files ${file1Id} and ${file2Id}`);

    const file1 = await this.store.findRecord('file', String(file1Id));
    const file2 = await this.store.findRecord('file', String(file2Id));

    return {
      file: file1,
      fileOld: file2,
    };
  }
}
