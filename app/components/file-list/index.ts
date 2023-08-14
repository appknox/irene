/* eslint-disable ember/no-observers */
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import Store from '@ember-data/store';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { addObserver, removeObserver } from '@ember/object/observers';

import ProjectModel from 'irene/models/project';
import FileModel from 'irene/models/file';
import { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import RealtimeService from 'irene/services/realtime';
import ENV from 'irene/config/environment';
import { AkBreadcrumbsItemSignature } from 'irene/components/ak-breadcrumbs/item';
import IntlService from 'ember-intl/services/intl';
import RouterService from '@ember/routing/router-service';

type FilesQueryResponse = DS.AdapterPopulatedRecordArray<FileModel> & {
  meta: { count: number };
};

interface FileListSignature {
  Args: {
    project: ProjectModel | null;
  };
}

export default class FileListComponent extends Component<FileListSignature> {
  @service declare store: Store;
  @service declare router: RouterService;
  @service declare intl: IntlService;
  @service declare realtime: RealtimeService;

  @tracked filesResponse: FilesQueryResponse | null = null;
  @tracked baseFile: FileModel | null = null;
  @tracked fileToCompare: FileModel | null = null;
  @tracked limit = ENV.paginate.perPageLimit;
  @tracked offset = 0;

  constructor(owner: unknown, args: FileListSignature['Args']) {
    super(owner, args);

    addObserver(this.realtime, 'FileCounter', this, this.observeFileCounter);

    this.getFiles.perform();
  }

  get breadcrumbItems(): AkBreadcrumbsItemSignature['Args'][] {
    return [
      {
        route: 'authenticated.projects',
        linkTitle: this.intl.t('allProjects'),
      },
      {
        route: 'authenticated.project.files',
        linkTitle: this.project?.get('packageName'),
        model: this.project?.get('id'),
      },
      {
        route: 'authenticated.project.files',
        linkTitle: this.intl.t('allUploads'),
        model: this.project?.get('id'),
      },
    ];
  }

  get project() {
    return this.args.project;
  }

  get files() {
    return this.filesResponse?.toArray();
  }

  get totalFilesCount() {
    return this.filesResponse?.meta.count || 0;
  }

  get sortedFiles() {
    const sortProperties = ['createdOn:desc'];

    return this.filesResponse?.sortBy(...sortProperties).toArray();
  }

  get hasFiles() {
    return Number(this.filesResponse?.length) > 0;
  }

  get disableCompareBtn() {
    return !this.baseFile || !this.fileToCompare;
  }

  // Reloads the files list whenever the file counter changes
  observeFileCounter() {
    this.getFiles.perform();
  }

  removeFileCounterObserver() {
    removeObserver(this.realtime, 'FileCounter', this, this.observeFileCounter);
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

  @action onCompareBtnClick() {
    this.router.transitionTo(
      'authenticated.dashboard.compare',
      `${this.baseFile?.id}...${this.fileToCompare?.id}`,
      { queryParams: { referrer: 'all_uploads' } }
    );
  }

  @action handleFileSelect(file: FileModel | null) {
    const fileIsCompareFile = file?.id === this.fileToCompare?.id;

    if (!this.baseFile && !fileIsCompareFile) {
      this.baseFile = file;

      return;
    }

    if (file?.id === this.baseFile?.id) {
      this.baseFile = null;

      return;
    }

    if (fileIsCompareFile) {
      this.fileToCompare = null;

      return;
    }

    this.fileToCompare = file;
  }

  @action handleFile1Delete() {
    this.baseFile = null;
  }

  @action handleFile2Delete() {
    this.fileToCompare = null;
  }

  getFiles = task(async () => {
    const query = {
      projectId: this.project?.get('id'),
      limit: this.limit,
      offset: this.offset,
    };

    const files = (await this.store.query('file', query)) as FilesQueryResponse;

    this.filesResponse = files;
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    FileList: typeof FileListComponent;
  }
}
