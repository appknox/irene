import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';
import type { EmberTableSort } from 'ember-table';

import ENUMS from 'irene/enums';
import ENV from 'irene/config/environment';
import type FileModel from 'irene/models/file';

export interface FileDetailsStaticScanSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsStaticScan extends Component<FileDetailsStaticScanSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;
  @service declare ajax: any;

  @tracked showRescanModal = false;

  @tracked sorts: EmberTableSort[] = [
    { isAscending: false, valuePath: 'computedRisk' },
  ];

  get breadcrumbItems() {
    return [
      {
        route: 'authenticated.dashboard.projects',
        linkTitle: this.intl.t('allProjects'),
      },
      {
        route: 'authenticated.dashboard.file',
        linkTitle: this.intl.t('scanDetails'),
        model: this.args.file.id,
      },
      {
        route: 'authenticated.dashboard.file.static-scan',
        linkTitle: this.intl.t('sastResults'),
        model: this.args.file.id,
      },
    ];
  }

  get tRescanInitiated() {
    return this.intl.t('rescanInitiated');
  }

  get filterBy() {
    return ENUMS.VULNERABILITY_TYPE.STATIC;
  }

  get columns() {
    return [
      {
        name: this.intl.t('impact'),
        valuePath: 'computedRisk',
        component: 'file-details/vulnerability-analysis/impact',
        width: 50,
        textAlign: 'center',
      },
      {
        name: this.intl.t('title'),
        width: 250,
        valuePath: 'vulnerability.name',
        isSortable: false,
      },
    ];
  }

  get file() {
    return this.args.file;
  }

  get analyses() {
    return this.file.analyses;
  }

  get filteredVulnerabilityCount() {
    const vulnerabilityType = this.filterBy;

    const filteredAnalysis = this.analyses?.filter((a) =>
      a.hasType(vulnerabilityType)
    );

    return filteredAnalysis.length;
  }

  get tabItems() {
    return [
      {
        id: 'vulnerability-details',
        label: this.intl.t('vulnerabilityDetails'),
        route: 'authenticated.dashboard.file.static-scan',
        currentWhen: 'authenticated.dashboard.file.static-scan',
      },
    ];
  }

  @action
  handleRescanModalOpen() {
    this.showRescanModal = true;
  }

  @action
  updateSorts(sorts: EmberTableSort[]) {
    this.sorts = sorts;
  }

  handleRescanApp = task(async () => {
    try {
      const data = {
        file_id: this.args.file.id,
      };

      await this.ajax.post(ENV.endpoints['rescan'] ?? '', {
        data,
      });

      this.notify.info(this.tRescanInitiated);

      if (!this.isDestroyed) {
        this.showRescanModal = false;
      }
    } catch (error) {
      this.notify.error((error as AjaxError).payload.detail);
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::StaticScan': typeof FileDetailsStaticScan;
  }
}
