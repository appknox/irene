import Route from '@ember/routing/route';
import { debug } from '@ember/debug';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import type Store from 'ember-data/store';

import { type FileCompareFilterKey } from 'irene/utils/compare-files';
import type FileModel from 'irene/models/file';
import type AnalysisOverviewModel from 'irene/models/analysis-overview';

export interface CompareRouteModel {
  file: FileModel;
  unknownAnalysisStatus: boolean;
  fileOld: FileModel;
  file1Analyses: AnalysisOverviewModel[];
  file2Analyses: AnalysisOverviewModel[];
  isInvalidCompare?: boolean;
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

  fetchFileAnalyses = task(async (fileId: string) => {
    return await this.store.query('analysis-overview', {
      fileId,
    });
  });

  async model(params: CompareRouteQueryParams): Promise<CompareRouteModel> {
    const files = params.files.split('...');
    const [file1Id, file2Id] = files;

    debug(`Comparing files ${file1Id} and ${file2Id}`);

    // Both ids are in the URL, so load the two files together.
    const [file1, file2] = await Promise.all([
      this.store.findRecord('file', String(file1Id)),
      this.store.findRecord('file', String(file2Id)),
    ]);

    const file1Prj = file1?.project;
    const file2Prj = file2?.project;

    const areOfDifferentProjects = file1Prj?.get('id') !== file2Prj?.get('id');
    const isSameFile = file1?.get('id') === file2?.get('id');
    const isInvalidCompare = areOfDifferentProjects || isSameFile;
    const showUnknownAnalysis = Boolean(file1Prj?.get('showUnknownAnalysis'));

    // If the files are of different projects, return an empty model
    if (isInvalidCompare) {
      return {
        file: file1,
        fileOld: file2,
        file1Analyses: [],
        file2Analyses: [],
        unknownAnalysisStatus: showUnknownAnalysis,
        isInvalidCompare,
      };
    }

    const [file1Analyses, file2Analyses] = await Promise.all([
      this.fetchFileAnalyses.perform(file1?.id),
      this.fetchFileAnalyses.perform(file2?.id),
    ]);

    return {
      file: file1,
      fileOld: file2,
      file1Analyses: file1Analyses.slice(),
      file2Analyses: file2Analyses.slice(),
      unknownAnalysisStatus: showUnknownAnalysis,
    };
  }
}
