import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { later } from '@ember/runloop';
import RouterService from '@ember/routing/router-service';
import IntlService from 'ember-intl/services/intl';

import FileModel from 'irene/models/file';
import { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider/index';
import {
  FileCompareFilterKey,
  FileComparisonItem,
} from 'irene/utils/compare-files';

export type FileCompareTableData =
  | FileComparisonItem
  | {
      vulnerability: null;
      file1: FileModel | null;
      file2: FileModel | null;
    };

interface FileCompareTableSignature {
  Args: {
    files: [file1: FileModel | null, file2: FileModel | null];
    filteredComparisons: FileComparisonItem[];
    comparisonFilterKey: FileCompareFilterKey;
  };
}

export default class FileCompareTableComponent extends Component<FileCompareTableSignature> {
  @service('browser/window') declare window: Window;
  @service declare intl: IntlService;
  @service declare router: RouterService;

  // TODO: File compare
  emptyMessages = {
    newRisks: 'No new issues have been found for this comparison',
    recurring: 'No recurring issues have been found between both files',
    untested: 'All test scans have been performed in both files.',
    resolved: 'No resolved issues have been found for this comparison',
  };

  @tracked limit = 10;
  @tracked offset = 0;

  get columns() {
    return [
      {
        name: this.intl.t('testCase'),
        component: 'file-compare/table/test-case',
        width: 100,
      },
      {
        name: this.intl.t('riskType'),
        component: 'file-compare/table/risk-type',
        textAlign: 'center',
        width: 50,
      },
    ];
  }

  get filteredComparisons() {
    return this.args.filteredComparisons;
  }

  get compareFilterCategory() {
    return this.args.comparisonFilterKey;
  }

  get emptyResultMessage() {
    return this.emptyMessages[this.compareFilterCategory];
  }

  get file1() {
    return this.args.files[0];
  }

  get file2() {
    return this.args.files[1];
  }

  get hasComparisons() {
    return this.filteredComparisons.length > 0;
  }

  get hasNoComparisons() {
    return !this.hasComparisons;
  }

  get comparisonTableData() {
    let data = [...this.filteredComparisons];

    if (data.length >= 10) {
      data = data.splice(this.offset, this.limit);
    }

    if (this.hasComparisons) {
      // First row is designed differently
      // Contains titles for the rest rows
      const firstRow = {
        vulnerability: null,
        file1: this.file1,
        file2: this.file2,
      };

      return [firstRow, ...data];
    }

    return data;
  }

  // Comparison click handler
  @action handleComparisonClick({
    rowValue: comparison,
  }: {
    rowValue: FileComparisonItem;
  }) {
    // For first row
    if (comparison.vulnerability === null) {
      return;
    }

    this.router.transitionTo(
      'authenticated.dashboard.file-vul-compare',
      `${this.file1?.id}...${this.file2?.id}`,
      String(comparison.vulnerability?.get('id')),
      {
        queryParams: {
          referrer: this.router.currentRoute?.queryParams?.['referrer'],
        },
      }
    );
  }

  // Table Actions
  @action goToPage(args: PaginationProviderActionsArgs) {
    const { limit, offset } = args;

    this.limit = limit;
    this.offset = offset;

    this.window.scrollTo(0, 0);
  }

  @action onItemPerPageChange(args: PaginationProviderActionsArgs) {
    const { limit } = args;
    const offset = 0;

    this.limit = limit;
    this.offset = offset;

    // Allows rendering table change before scrolling
    later(() => this.window.scrollTo(0, 0), 150);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileCompare::Table': typeof FileCompareTableComponent;
  }
}
