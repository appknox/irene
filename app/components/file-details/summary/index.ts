import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import IntlService from 'ember-intl/services/intl';

import FileModel from 'irene/models/file';

dayjs.extend(relativeTime);

export interface FileDetailsSummarySignature {
  Args: {
    file: FileModel;
  };
}

interface FileSummary {
  label: string;
  value?: string;
  hideDivider?: boolean;
  component?: unknown;
}

interface FileMoreMenuItem {
  label: string;
  iconName: string;
  route: string;
  routeModel: string | undefined;
  hideDivider?: boolean;
}

export default class FileDetailsSummaryComponent extends Component<FileDetailsSummarySignature> {
  @service declare intl: IntlService;

  @tracked showMoreFileSummary = false;
  @tracked fileMoreMenuRef: HTMLElement | null = null;

  get packageName() {
    return this.args.file.project.get('packageName');
  }

  get fileMoreMenuList() {
    const hasMultipleFiles = this.args.file.project.get('hasMultipleFiles');

    return [
      hasMultipleFiles && {
        label: this.intl.t('allUploads'),
        iconName: 'format-list-bulleted',
        route: 'authenticated.project.files',
        routeModel: this.args.file.project.get('id'),
      },
      hasMultipleFiles && {
        label: this.intl.t('compare'),
        iconName: 'compare-arrows',
        route: 'authenticated.choose',
        routeModel: this.args.file.id,
      },
      {
        label: this.intl.t('settings'),
        iconName: 'settings',
        route: 'authenticated.project.settings',
        routeModel: this.args.file.project.get('id'),
        hideDivider: true,
      },
    ].filter(Boolean) as FileMoreMenuItem[];
  }

  get fileSummary() {
    const summaryList: FileSummary[] = [
      {
        label: this.intl.t('platform'),
        component: 'file-details/summary/app-platform',
      },
      {
        label: this.intl.t('fileID'),
        component: 'file-details/summary/file-id',
      },
    ];

    if (this.showMoreFileSummary) {
      summaryList.pushObjects([
        {
          label: this.intl.t('scanStarted'),
          value: dayjs(this.args.file.createdOn).fromNow(),
        },
        { label: this.intl.t('version'), value: this.args.file.version },
        {
          label: this.intl.t('versionCode'),
          value: this.args.file.versionCode,
        },
      ]);
    }

    // hiding divider for last item
    (summaryList.lastObject as FileSummary).hideDivider = true;

    return summaryList;
  }

  @action
  handleViewReportDrawerOpen() {}

  @action
  handleFileMoreMenuOpen(event: MouseEvent) {
    this.fileMoreMenuRef = event.currentTarget as HTMLElement;
  }

  @action
  handleFileMoreMenuClose() {
    this.fileMoreMenuRef = null;
  }

  @action
  handleFileSummaryToggle() {
    this.showMoreFileSummary = !this.showMoreFileSummary;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::Summary': typeof FileDetailsSummaryComponent;
  }
}
