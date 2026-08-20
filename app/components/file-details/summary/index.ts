import { action } from '@ember/object';
import { service } from '@ember/service';
import { capitalize } from '@ember/string';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type RouterService from '@ember/routing/router-service';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import type FileModel from 'irene/models/file';
import type OffsecScanAdapter from 'irene/adapters/offsec-scan';
import type { PoweredByAiDrawerInfo } from 'irene/components/powered-by-ai/drawer';
import type OrganizationService from 'irene/services/organization';
import parseError from 'irene/utils/parse-error';

export interface FileDetailsSummarySignature {
  Args: {
    file: FileModel;
    showPoweredByAiChip?: boolean;
  };
}

interface FileMoreMenuItem {
  group?: string;
  query?: Record<string, unknown>;
  label: string;
  iconName: 'settings' | 'compare-arrows' | 'apps';
  route: string;
  routeModel: string | undefined;
  hideDivider?: boolean;
}

export default class FileDetailsSummaryComponent extends Component<FileDetailsSummarySignature> {
  @service declare store: Store;
  @service declare router: RouterService;
  @service declare intl: IntlService;
  @service declare organization: OrganizationService;
  @service('notifications') declare notify: NotificationService;

  @tracked showMoreFileSummary = false;
  @tracked fileMoreMenuRef: HTMLElement | null = null;

  get packageName() {
    return this.args.file.project.get('packageName');
  }

  get isLegacy() {
    return this.args.file.isLegacyKnoxIQScan;
  }

  get knoxIqDrawerInfo(): PoweredByAiDrawerInfo[] {
    return [
      {
        title: this.intl.t('knoxIq.fileDetailsDrawer.q1Title'),
        body: this.intl.t('knoxIq.fileDetailsDrawer.q1Body'),
        marginTop: 'mt-2',
      },
      {
        title: this.intl.t('knoxIq.fileDetailsDrawer.q2Title'),
        body: this.intl.t('knoxIq.fileDetailsDrawer.q2Body'),
        contentList: [
          this.intl.t('knoxIq.fileDetailsDrawer.q2List1'),
          this.intl.t('knoxIq.fileDetailsDrawer.q2List2'),
          this.intl.t('knoxIq.fileDetailsDrawer.q2List3'),
          this.intl.t('knoxIq.fileDetailsDrawer.q2List4'),
          this.intl.t('knoxIq.fileDetailsDrawer.q2List5'),
          this.intl.t('knoxIq.fileDetailsDrawer.q2List6'),
        ],
        marginTop: 'mt-3',
      },
      {
        title: this.intl.t('knoxIq.fileDetailsDrawer.q3Title'),
        body: this.intl.t('knoxIq.fileDetailsDrawer.q3Body'),
        contentList: [
          this.intl.t('knoxIq.fileDetailsDrawer.q3List1'),
          this.intl.t('knoxIq.fileDetailsDrawer.q3List2'),
          this.intl.t('knoxIq.fileDetailsDrawer.q3List3'),
          this.intl.t('knoxIq.fileDetailsDrawer.q3List4'),
        ],
        marginTop: 'mt-3',
      },
    ];
  }

  get fileMoreMenuList() {
    const hasMultipleFiles = this.args.file.project.get('hasMultipleFiles');

    return [
      (!this.organization.isKnoxIqEnabled || this.isLegacy) &&
        hasMultipleFiles && {
          group: this.intl.t('fileLevel'),
          label: this.intl.t('compare'),
          iconName: 'compare-arrows',
          route: 'authenticated.dashboard.choose',
          routeModel: this.args.file.id,
        },
      hasMultipleFiles && {
        group: this.intl.t('projectLevel'),
        label: this.intl.t('allUploads'),
        iconName: 'apps',
        route: 'authenticated.dashboard.project.files',
        routeModel: this.args.file.project.get('id'),
      },
      {
        label: this.intl.t('settings'),
        iconName: 'settings',
        route: 'authenticated.dashboard.project.settings',
        routeModel: this.args.file.project.get('id'),
        hideDivider: true,
      },
    ].filter(Boolean) as FileMoreMenuItem[];
  }

  get fileSummary() {
    return [
      { label: this.intl.t('version'), value: this.args.file.version },
      {
        label: capitalize(this.intl.t('versionCode')),
        value: this.args.file.versionCode,
      },
      {
        label: this.intl.t('uploadedOn'),
        value: this.args.file.createdOnDateTime,
      },
    ];
  }

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

  get isOffsecEligible(): boolean {
    return Boolean(
      this.args.file.offsecEligible ?? this.args.file.isOffsecEligible
    );
  }

  get isOffsecInitiated(): boolean {
    return Boolean(
      this.args.file.offsecInitiated ?? this.args.file.isOffsecInitiated
    );
  }

  get showInitiateOffsecBtn(): boolean {
    return this.isOffsecEligible && !this.isOffsecInitiated;
  }

  initiateOffsecPentestTask = task(async () => {
    try {
      const adapter = this.store.adapterFor('offsec-scan') as OffsecScanAdapter;
      const res = (await adapter.triggerScan(this.args.file.id)) as {
        id?: string | number;
        scan_id?: string | number;
        scanId?: string | number;
      };

      this.args.file.offsecInitiated = true;
      this.args.file.isOffsecInitiated = true;
      this.notify.success('Offsec pentest scan initiated successfully!');

      const scanId =
        res?.scan_id ?? res?.scanId ?? res?.id ?? this.args.file.id;

      this.router.transitionTo(
        'authenticated.dashboard.offensive-security.scan',
        scanId
      );
    } catch (err) {
      this.notify.error(parseError(err));
    }
  });

  @action
  handleInitiateOffsecPentest() {
    this.initiateOffsecPentestTask.perform();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::Summary': typeof FileDetailsSummaryComponent;
  }
}
