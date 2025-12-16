import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';
import type RouterService from '@ember/routing/router-service';

import {
  compareFileAnalyses,
  getFileComparisonCategories,
} from 'irene/utils/compare-files';

import { scrollDashboardMainContainerTo } from 'irene/utils/scroll-to-top';
import type AkBreadcrumbsService from 'irene/services/ak-breadcrumbs';
import type FileModel from 'irene/models/file';
import type AnalysisOverviewModel from 'irene/models/analysis-overview';
import type EventBusService from 'irene/services/event-bus';

interface FileCompareSignature {
  Args: {
    file1: FileModel | null;
    file2: FileModel | null;
    unknownAnalysisStatus: boolean;
    file1Analyses: AnalysisOverviewModel[];
    file2Analyses: AnalysisOverviewModel[];
    isInvalidCompare?: boolean;
  };
}

type FileCompareTabItem = {
  id: string;
  route: string;
  label: string;
  badgeCount?: number;
};

export default class FileCompareComponent extends Component<FileCompareSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service declare router: RouterService;
  @service declare eventBus: EventBusService;
  @service('ak-breadcrumbs') declare breadcrumbsService: AkBreadcrumbsService;

  @tracked file1Analyses: AnalysisOverviewModel[] = [];
  @tracked file2Analyses: AnalysisOverviewModel[] = [];

  @tracked expandFilesOverview = false;

  constructor(owner: unknown, args: FileCompareSignature['Args']) {
    super(owner, args);

    this.file1Analyses = this.args.file1Analyses;
    this.file2Analyses = this.args.file2Analyses;

    // Handle websocket analysis messages
    this.eventBus.on(
      'ws:analysis-overview:update',
      this,
      this.handleAnalysisUpdate
    );
  }

  get file1() {
    return this.args.file1;
  }

  get file2() {
    return this.args.file2;
  }

  get comparisons() {
    return compareFileAnalyses(this.file1Analyses, this.file2Analyses);
  }

  get isInvalidCompare() {
    return Boolean(this.args.isInvalidCompare);
  }

  get isSameFile() {
    return Boolean(this.file1?.get('id') === this.file2?.get('id'));
  }

  get tabItems() {
    const fileCompareCategories = getFileComparisonCategories(this.comparisons);

    return [
      {
        id: 'recurring-issues',
        route: 'authenticated.dashboard.compare.index',
        label: this.intl.t('fileCompare.recurringIssues'),
        badgeCount: fileCompareCategories.recurring.length,
      },
      {
        id: 'new-issues',
        route: 'authenticated.dashboard.compare.new-issues',
        label: this.intl.t('fileCompare.newIssues'),
        badgeCount: fileCompareCategories.newRisks.length,
      },
      {
        id: 'resolved-issues',
        route: 'authenticated.dashboard.compare.resolved-test-cases',
        label: this.intl.t('fileCompare.resolvedIssues'),
        badgeCount: fileCompareCategories.resolved.length,
      },
      this.args.unknownAnalysisStatus
        ? {
            id: 'untested-cases',
            route: 'authenticated.dashboard.compare.untested-cases',
            label: this.intl.t('untested'),
            badgeCount: fileCompareCategories.untested.length,
          }
        : null,
    ].filter(Boolean) as FileCompareTabItem[];
  }

  get isAllUploadsBreadcrumb() {
    return this.breadcrumbsService.breadcrumbItems.find((it) =>
      it.route?.includes('authenticated.dashboard.project.files')
    );
  }

  @action
  goToCompareSelect() {
    if (this.isAllUploadsBreadcrumb) {
      this.router.transitionTo(
        'authenticated.dashboard.project.files',
        String(this.file1?.project?.get('id'))
      );

      return;
    }

    this.router.transitionTo(
      'authenticated.dashboard.choose',
      String(this.file1?.id)
    );
  }

  @action
  handleExpandFilesOverview() {
    // Do not allow expanding files overview if the files are of different projects
    if (this.isInvalidCompare) {
      return;
    }

    this.expandFilesOverview = !this.expandFilesOverview;

    scrollDashboardMainContainerTo({ top: 0, behavior: 'smooth' });
  }

  @action
  handleAnalysisUpdate(aom: AnalysisOverviewModel) {
    const aomFileId = aom.file.get('id');
    const fileIdsAndAnalyses = [this.file1?.id, this.file2?.id];

    const targetedFileIdx = fileIdsAndAnalyses.findIndex(
      (id) => String(aomFileId) === String(id)
    );

    // Return if newly created analysis is not for this file
    if (targetedFileIdx === -1) {
      return;
    }

    const isFile1 = targetedFileIdx === 0;
    const analyses = isFile1 ? this.file1Analyses : this.file2Analyses;
    const analysisExistsInFile = analyses.find((a) => a.id === aom.id);

    // Update analyses list any time a new analysis is created or updated
    if (!analysisExistsInFile) {
      this[isFile1 ? 'file1Analyses' : 'file2Analyses'] = [...analyses, aom];
    }
  }

  willDestroy(): void {
    super.willDestroy();

    // Handle websocket analysis messages
    this.eventBus.off(
      'ws:analysis-overview:update',
      this,
      this.handleAnalysisUpdate
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    FileCompare: typeof FileCompareComponent;
  }
}
