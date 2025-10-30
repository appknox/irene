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
import AnalysisModel from 'irene/models/analysis';

export interface CompareRouteModel {
  file: FileModel;
  unknownAnalysisStatus?: UnknownAnalysisStatusModel | null;
  fileOld: FileModel;
  file1Analyses: AnalysisModel[];
  file2Analyses: AnalysisModel[];
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

    const file1Analyses = await this.store.query('analysis', {
      fileId: file1?.id,
    });

    const file2Analyses = await this.store.query('analysis', {
      fileId: file2?.id,
    });

    const unknownAnalysisStatus = await this.store.queryRecord(
      'unknown-analysis-status',
      {
        id: file1?.profile.get('id'),
      }
    );

    return {
      file: file1,
      fileOld: file2,
      file1Analyses: file1Analyses.slice(),
      file2Analyses: file2Analyses.slice(),
      unknownAnalysisStatus,
    };
  }
}
