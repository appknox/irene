import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import RouterService from '@ember/routing/router-service';
import IntlService from 'ember-intl/services/intl';

import styles from './index.scss';
import ENUMS from 'irene/enums';
import type FileModel from 'irene/models/file';
import type ProjectModel from 'irene/models/project';

interface FileCompareHeaderSignature {
  Element: HTMLElement;
  Args: {
    file1: FileModel | null;
    file2?: FileModel | null;
    project?: ProjectModel | null;
    expandFilesOverview?: boolean;
    selectedScanType?: ScanTypeObject;
    scanTypeValue?: number;
    filterScanTypeChange?: (scanType: ScanTypeObject) => void;
  };
  Blocks: {
    default: [];
    breadcrumbs: [];
    file2Content: [];
    file1Content: [];
    header: [];
    headerCTA: [];
  };
}

interface ScanTypeObject {
  key: string;
  value: number;
}

export default class FileCompareHeaderComponent extends Component<FileCompareHeaderSignature> {
  @service declare router: RouterService;
  @service declare intl: IntlService;

  get file1() {
    return this.args.file1;
  }

  get file2() {
    return this.args.file2;
  }

  get platformIconClass() {
    return (
      this.args.project?.get('platformIconClass') ||
      this.file1?.project.get('platformIconClass')
    );
  }

  get scanTypeObjects(): ScanTypeObject[] {
    return [
      {
        key: 'All',
        value: -1,
      },
      {
        key: 'SAST',
        value: ENUMS.SCAN_TYPE.STATIC_SCAN,
      },
      {
        key: 'DAST',
        value: ENUMS.SCAN_TYPE.DYNAMIC_SCAN,
      },
      {
        key: 'API Scan',
        value: ENUMS.SCAN_TYPE.API_SCAN,
      },
    ];
  }

  get dropDownClass() {
    return styles['filter-input-dropdown'];
  }

  get triggerClass() {
    return styles['filter-input'];
  }

  @action goToSettings() {
    this.router.transitionTo(
      'authenticated.dashboard.project.settings',
      String(this.args.project?.get('id'))
    );
  }

  @action
  changeFilter(scanType: ScanTypeObject) {
    this.args.filterScanTypeChange?.(scanType);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileCompare::Header': typeof FileCompareHeaderComponent;
  }
}
