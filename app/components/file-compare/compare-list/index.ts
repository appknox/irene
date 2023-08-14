// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import Store from '@ember-data/store';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';
import RouterService from '@ember/routing/router-service';

import FileModel from 'irene/models/file';
import { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import ProjectModel from 'irene/models/project';
import ENV from 'irene/config/environment';
import { AkBreadcrumbsItemSignature } from 'irene/components/ak-breadcrumbs/item';

type FilesQueryResponse = DS.AdapterPopulatedRecordArray<FileModel> & {
  meta: { count: number };
};

interface FileCompareCompareListSignature {
  Args: {
    project: ProjectModel | null;
    fileOld: FileModel | null;
  };
}

export default class FileCompareCompareListComponent extends Component<FileCompareCompareListSignature> {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service declare router: RouterService;

  @tracked files: FilesQueryResponse | null = null;
  @tracked fileToCompare: FileModel | null = null;
  @tracked limit = ENV.paginate.perPageLimit;
  @tracked offset = 0;

  constructor(owner: unknown, args: FileCompareCompareListSignature['Args']) {
    super(owner, args);

    this.getFiles.perform();
  }

  get fileOld() {
    return this.args.fileOld;
  }

  get project() {
    return this.args.project;
  }

  get totalFilesCount() {
    return Number(this.files?.meta?.count) || 0;
  }

  get otherFilesInTheProject() {
    const otherFiles = this.files?.filter(
      (file) => this.fileOld?.get('id') !== file.get('id')
    );

    return otherFiles;
  }

  get breadcrumbItems(): AkBreadcrumbsItemSignature['Args'][] {
    return [
      {
        route: 'authenticated.projects',
        linkTitle: this.intl.t('allProjects'),
      },
      {
        route: 'authenticated.dashboard.file',
        linkTitle: this.intl.t('scanDetails'),
        model: this.fileOld?.id,
      },
      {
        route: 'authenticated.dashboard.compare',
        linkTitle: this.intl.t('fileCompare.fileSelection'),
        model: this.fileOld?.id,
      },
    ];
  }

  get hasFiles() {
    return this.totalFilesCount > 0;
  }

  // Table Actions
  @action goToPage(args: PaginationProviderActionsArgs) {
    const { limit, offset } = args;

    this.limit = limit;
    this.offset = offset;

    this.getFiles.perform();
  }

  @action onItemPerPageChange(args: PaginationProviderActionsArgs) {
    const { limit } = args;
    const offset = 0;

    this.limit = limit;
    this.offset = offset;

    this.getFiles.perform();
  }

  get columns() {
    return [
      {
        name: this.intl.t('testCase'),
        component: 'file-compare/table/test-case',
        width: 150,
      },
      {
        name: this.intl.t('riskType'),
        component: 'file-compare/table/risk-type',
        textAlign: 'center',
        width: 50,
      },
    ];
  }

  @action handleFileSelect(file: FileModel | null) {
    if (file?.id === this.fileToCompare?.id) {
      this.fileToCompare = null;
    } else {
      this.fileToCompare = file;
    }
  }

  @action onCompareBtnClick() {
    this.router.transitionTo(
      'authenticated.dashboard.compare',
      `${this.fileOld?.id}...${this.fileToCompare?.id}`
    );
  }

  getFiles = task(async () => {
    const query = {
      projectId: this.project?.get('id'),
      limit: this.limit,
      offset: this.offset,
    };

    const files = (await this.store.query('file', query)) as FilesQueryResponse;

    this.files = files;
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileCompare::CompareList': typeof FileCompareCompareListComponent;
  }
}
