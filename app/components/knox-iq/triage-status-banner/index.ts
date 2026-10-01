import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';
import type RouterService from '@ember/routing/router-service';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import type LoggerService from 'irene/services/logger';
import type OrganizationService from 'irene/services/organization';
import type AnalysisModel from 'irene/models/analysis';
import type FileModel from 'irene/models/file';
import type KnoxiqScanModel from 'irene/models/knoxiq-scan';
import type VulnerabilityModel from 'irene/models/vulnerability';

export interface KnoxIqTriageStatusBannerSignature {
  Element: HTMLDivElement;
  Args: {
    analysis: AnalysisModel;
  };
}

export default class KnoxIqTriageStatusBannerComponent extends Component<KnoxIqTriageStatusBannerSignature> {
  @service declare intl: IntlService;
  @service declare logger: LoggerService;
  @service declare organization: OrganizationService;
  @service declare router: RouterService;
  @service declare store: Store;

  @tracked knoxiqScan: KnoxiqScanModel | null = null;
  @tracked file: FileModel | null = null;
  @tracked vulnerability: VulnerabilityModel | null = null;
  @tracked sawTriageInProgress = false;

  constructor(owner: unknown, args: KnoxIqTriageStatusBannerSignature['Args']) {
    super(owner, args);

    this.loadTriageState.perform();
  }

  get fileId() {
    return this.args.analysis.belongsTo('file').id();
  }

  // Static and dynamic together — the pair the scan details page also reads.
  get scanStatuses() {
    const knoxiqScan = this.knoxiqScan;

    if (!knoxiqScan) {
      return [];
    }

    return [knoxiqScan.sastStatus, knoxiqScan.dastStatus];
  }

  get isKnoxiqEnabled() {
    return (
      Boolean(this.organization.isKnoxIqEnabled) &&
      !this.scanStatuses.includes(ENUMS.KNOXIQ_SCAN_STATUS.LEGACY)
    );
  }

  // KnoxIQ only triages SAST and DAST findings for now.
  get isKnoxiqScanType() {
    const { STATIC, DYNAMIC } = ENUMS.VULNERABILITY_TYPE;
    const types = this.vulnerability?.types;

    return Boolean(types?.includes(STATIC) || types?.includes(DYNAMIC));
  }

  get isKnoxiqApplicable() {
    return this.isKnoxiqEnabled && this.isKnoxiqScanType;
  }

  get isTriageInProgress() {
    const { PENDING, RUNNING } = ENUMS.KNOXIQ_SCAN_STATUS;

    return (
      this.isKnoxiqApplicable &&
      this.scanStatuses.some(
        (status) => status === PENDING || status === RUNNING
      )
    );
  }

  get isTriageCompleted() {
    return (
      this.isKnoxiqApplicable &&
      this.scanStatuses.includes(ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED)
    );
  }

  get isTriageNotInitiated() {
    const { NOT_TRIGGERED, ERRORED } = ENUMS.KNOXIQ_SCAN_STATUS;

    return (
      this.isKnoxiqApplicable &&
      !this.file?.isKnoxiqAutomated &&
      !this.isTriageInProgress &&
      !this.isTriageCompleted &&
      !this.scanStatuses.includes(ERRORED) &&
      this.scanStatuses.includes(NOT_TRIGGERED)
    );
  }

  get isVisible() {
    return this.isTriageNotInitiated || this.isTriageInProgress;
  }

  get message() {
    return this.isTriageNotInitiated
      ? this.intl.t('knoxIq.triageNotInitiated')
      : this.intl.t('knoxIq.triageInProgress');
  }

  get triageStateKey() {
    return `${this.scanStatuses.join(':')}:${this.isKnoxiqApplicable}`;
  }

  @action
  handleTriageStateChange() {
    if (this.isTriageInProgress) {
      this.sawTriageInProgress = true;

      return;
    }

    const fileId = this.fileId;

    if (!this.sawTriageInProgress || !this.isTriageCompleted || !fileId) {
      return;
    }

    // replace, so going Back does not land on a page that redirects again
    this.router.replaceWith(
      'authenticated.dashboard.file.knox-analysis',
      fileId,
      this.args.analysis.id
    );
  }

  loadTriageState = task(async () => {
    const fileId = this.fileId;

    try {
      const [file, vulnerability] = await waitForPromise(
        Promise.all([this.args.analysis.file, this.args.analysis.vulnerability])
      );

      this.file = file ?? null;
      this.vulnerability = vulnerability ?? null;

      if (!fileId) {
        return;
      }

      this.knoxiqScan = await waitForPromise(
        this.store.queryRecord('knoxiq-scan', { id: fileId, fileId })
      );
    } catch (error) {
      // without the triage state the banner simply stays hidden
      this.logger.error(
        `Failed to load KnoxIQ triage state for analysis - ${this.args.analysis.id}`,
        error
      );
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'KnoxIq::TriageStatusBanner': typeof KnoxIqTriageStatusBannerComponent;
  }
}
