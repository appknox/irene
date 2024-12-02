import Route from '@ember/routing/route';
import { debug } from '@ember/debug';
import { inject as service } from '@ember/service';
import Store from '@ember-data/store';

import FileModel from 'irene/models/file';
import {
  FileCompareFilterKey,
  FileComparisonItem,
} from 'irene/utils/compare-files';
import UnknownAnalysisStatusModel from 'irene/models/unknown-analysis-status';

export interface CompareRouteModel {
  file: FileModel;
  unknownAnalysisStatus?: UnknownAnalysisStatusModel | null;
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

    const unknownAnalysisStatus = await this.store.queryRecord(
      'unknown-analysis-status',
      {
        id: file1?.profile.get('id'),
      }
    );

    return {
      file: file1,
      fileOld: file2,
      unknownAnalysisStatus,
    };
  }
}
