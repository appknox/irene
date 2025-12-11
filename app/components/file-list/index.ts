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
import RouterService from '@ember/routing/router-service';
import IntlService from 'ember-intl/services/intl';

import ProjectModel from 'irene/models/project';
import FileModel from 'irene/models/file';
import { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import RealtimeService from 'irene/services/realtime';
import parseError from 'irene/utils/parse-error';
import { ProjectFilesQueryParams } from 'irene/routes/authenticated/dashboard/project/files';

type FilesQueryResponse = DS.AdapterPopulatedRecordArray<FileModel> & {
  meta: { count: number };
};

interface FileListSignature {
  Args: {
    project: ProjectModel | null;
    queryParams: ProjectFilesQueryParams;
  };
}

export default class FileListComponent extends Component<FileListSignature> {
  @service declare store: Store;
  @service declare router: RouterService;
  @service declare intl: IntlService;
  @service declare realtime: RealtimeService;
  @service('notifications') declare notify: NotificationService;

  @tracked filesResponse: FilesQueryResponse | null = null;
  @tracked baseFile: FileModel | null = null;
  @tracked fileToCompare: FileModel | null = null;

  constructor(owner: unknown, args: FileListSignature['Args']) {
    super(owner, args);

    addObserver(this.realtime, 'FileCounter', this, this.observeFileCounter);

    const { files_limit, files_offset } = args.queryParams;

    this.getFiles.perform(files_limit, files_offset, false);
  }

  get limit() {
    return Number(this.args.queryParams.files_limit);
  }

  get offset() {
    return Number(this.args.queryParams.files_offset);
  }

  get project() {
    return this.args.project;
  }

  get files() {
    return this.filesResponse?.slice();
  }

  get totalFilesCount() {
    return this.filesResponse?.meta.count || 0;
  }

  get sortedFiles() {
    const sortProperties = ['createdOn:desc'];

    return this.filesResponse?.slice().sortBy(...sortProperties);
  }

  get hasFiles() {
    return Number(this.filesResponse?.length) > 0;
  }

  get disableCompareBtn() {
    return !this.baseFile || !this.fileToCompare;
  }

  // Reloads the files list whenever the file counter changes
  observeFileCounter() {
    this.getFiles.perform(this.limit, this.offset);
  }

  removeFileCounterObserver() {
    removeObserver(this.realtime, 'FileCounter', this, this.observeFileCounter);
  }

  willDestroy() {
    super.willDestroy();
    this.removeFileCounterObserver();
  }

  // Table Actions
  @action goToPage(args: PaginationProviderActionsArgs) {
    const { limit, offset } = args;

    this.getFiles.perform(limit, offset);
  }

  @action onItemPerPageChange(args: PaginationProviderActionsArgs) {
    const { limit } = args;
    const offset = 0;

    this.getFiles.perform(limit, offset);
  }

  @action onCompareBtnClick() {
    this.router.transitionTo(
      'authenticated.dashboard.compare',
      `${this.baseFile?.id}...${this.fileToCompare?.id}`
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

  setRouteQueryParams(limit: string | number, offset: string | number) {
    this.router.transitionTo({
      queryParams: {
        files_limit: limit,
        files_offset: offset,
      },
    });
  }

  getFiles = task(
    async (
      limit: string | number,
      offset: string | number,
      setQueryParams = true
    ) => {
      if (setQueryParams) {
        this.setRouteQueryParams(limit, offset);
      }

      const query = {
        projectId: this.project?.get('id'),
        limit: limit,
        offset: offset,
      };

      try {
        const files = (await this.store.query(
          'file',
          query
        )) as FilesQueryResponse;

        this.filesResponse = files;
      } catch (err) {
        const error = err as AdapterError;
        const status = Number(error?.errors?.[0]?.status);

        const isRateLimit = status === 429;

        if (isRateLimit) {
          return;
        }

        this.notify.error(parseError(error));
        this.filesResponse = null;
      }
    }
  );
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    FileList: typeof FileListComponent;
  }
}
