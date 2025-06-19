import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';

import type FileModel from 'irene/models/file';
import type Store from '@ember-data/store';
import type IreneAjaxService from 'irene/services/ajax';
import type ScanCoverageModel from 'irene/models/scan-coverage';

export interface FileDetailsDynamicScanResultsScanCoverageContext {
  isLoadingScreenCoverage: boolean;
  scanCoverage: ScanCoverageModel | null;
  isOldFileWithNoCoverage: boolean;
}

interface FileDetailsDynamicScanResultsScanCoverageProviderSignature {
  Args: {
    file: FileModel;
  };
  Blocks: {
    default: [FileDetailsDynamicScanResultsScanCoverageContext];
  };
}

export default class FileDetailsDynamicScanResultsScanCoverageProvider extends Component<FileDetailsDynamicScanResultsScanCoverageProviderSignature> {
  @service declare store: Store;
  @service declare ajax: IreneAjaxService;

  @tracked scanCoverage: ScanCoverageModel | null = null;
  @tracked isOldFileWithNoCoverage = false;

  constructor(
    owner: unknown,
    args: FileDetailsDynamicScanResultsScanCoverageProviderSignature['Args']
  ) {
    super(owner, args);

    this.getScreenCoverage.perform();
  }

  getScreenCoverage = task(async () => {
    try {
      const fileAdapter = this.store.adapterFor('file');
      const url = `${fileAdapter.buildURL('file', this.args.file.id)}/screen_coverage`;

      const res = await waitForPromise(
        this.ajax.request(url, { cache: 'no-store' })
      );

      const normalized = this.store.normalize('scan-coverage', res as object);

      this.scanCoverage = this.store.push(normalized) as ScanCoverageModel;
    } catch (error) {
      const err = error as Error;
      const status = err.status;

      // 400: New files for which file development framework has been calculated but we don’t support the framework yet(such as Android Flutter, Android Xamarin, Android React Native, iOS app etc)
      // 404: New files for which no dynamic scan has been started yet:
      if (status === 400 || status === 404) {
        this.scanCoverage = null;
      }

      // Old files for which file development framework has not been calculated(set to UNKNOWN)
      if (status === 410) {
        this.isOldFileWithNoCoverage = true;
      }
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Results::ScanCoverageProvider': typeof FileDetailsDynamicScanResultsScanCoverageProvider;
  }
}
