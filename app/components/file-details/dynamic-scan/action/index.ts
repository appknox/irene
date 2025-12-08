import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import type IntlService from 'ember-intl/services/intl';

import ENV from 'irene/config/environment';
import parseError from 'irene/utils/parse-error';
import type FileModel from 'irene/models/file';
import type DynamicscanModel from 'irene/models/dynamicscan';
import type IreneAjaxService from 'irene/services/ajax';
import type DynamicScanService from 'irene/services/dynamic-scan';
import type AnalyticsService from 'irene/services/analytics';

export interface DynamicScanActionSignature {
  Args: {
    onScanShutdown?: () => void;
    openActionDrawer?: () => void;
    file: FileModel;
    dynamicScanText: string;
    isAutomatedScan?: boolean;
    dynamicScan: DynamicscanModel | null;
  };
}

export default class DynamicScanActionComponent extends Component<DynamicScanActionSignature> {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service declare analytics: AnalyticsService;
  @service('notifications') declare notify: NotificationService;
  @service('dynamic-scan') declare dsService: DynamicScanService;

  get file() {
    return this.args.file;
  }

  get projectPlatform() {
    return this.file.project.get('platform');
  }

  get dynamicScanActionButton() {
    if (this.args.dynamicScan?.get('isStarting')) {
      return {
        icon: 'close' as const,
        text: this.intl.t('cancelScan'),
        testId: 'cancelBtn',
        variant: 'outlined' as const,
        color: 'neutral' as const,
        onClick: () => this.dynamicShutdown.perform(),
        loading: this.dynamicShutdown.isRunning,
        loaderColor: 'secondary' as const,
      };
    }

    if (this.args.dynamicScan?.get('isReadyOrRunning')) {
      return {
        icon: 'stop-circle' as const,
        text: this.intl.t('stop'),
        testId: 'stopBtn',
        loading: this.dynamicShutdown.isRunning,
        onClick: () => this.dynamicShutdown.perform(),
      };
    }

    if (
      this.args.dynamicScan?.get('isCompleted') ||
      this.args.dynamicScan?.get('isStatusError')
    ) {
      return {
        icon: 'refresh' as const,
        text: this.args.dynamicScanText,
        testId: 'restartBtn',
        onClick: this.openDynamicScanDrawer,
      };
    }

    return {
      icon: 'play-arrow' as const,
      text: this.args.dynamicScanText,
      testId: 'startBtn',
      onClick: this.openDynamicScanDrawer,
    };
  }

  @action
  openDynamicScanDrawer() {
    this.analytics.track({
      name: 'DYNAMIC_SCAN_START_EVENT',
      properties: {
        feature: 'dynamic_scan_drawer_opened',
        file_id: this.file.get('id'),
        file_name: this.file.get('name'),
      },
    });

    this.args.openActionDrawer?.();
  }

  dynamicShutdown = task({ drop: true }, async () => {
    try {
      await this.ajax.delete(
        `/dynamicscans/${this.args.dynamicScan?.get('id')}`,
        { namespace: ENV.namespace_v2 }
      );

      // Poll the dynamic scan status if the project org is different from the selected org
      // Pertains to the case where the file is being accessed by a superuser
      await this.dsService.pollDynamicScanStatusForSuperUser({
        file: this.file,
        isAutomatedScan: this.args.isAutomatedScan,
      });

      this.args.onScanShutdown?.();

      await this.file.reload();
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Action': typeof DynamicScanActionComponent;
  }
}
