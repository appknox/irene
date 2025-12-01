import Route from '@ember/routing/route';
import { debug } from '@ember/debug';
import { service } from '@ember/service';
import type Store from '@ember-data/store';

import { type FileCompareFilterKey } from 'irene/utils/compare-files';
import type FileModel from 'irene/models/file';
import type AnalysisOverviewModel from 'irene/models/analysis-overview';

export interface CompareRouteModel {
  file: FileModel;
  unknownAnalysisStatus: boolean;
  fileOld: FileModel;
  file1Analyses: AnalysisOverviewModel[];
  file2Analyses: AnalysisOverviewModel[];
}

export interface CompareChildrenRoutesModel {
  comparisonFilterKey: FileCompareFilterKey;
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

    const file1Analyses = await this.store.query('analysis-overview', {
      fileId: file1?.id,
    });

    const file2Analyses = await this.store.query('analysis-overview', {
      fileId: file2?.id,
    });

    return {
      file: file1,
      fileOld: file2,
      file1Analyses: file1Analyses.slice(),
      file2Analyses: file2Analyses.slice(),
      unknownAnalysisStatus: Boolean(file1?.project.get('showUnknownAnalysis')),
    };
  }
}
