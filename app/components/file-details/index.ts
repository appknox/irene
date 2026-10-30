import Component from '@glimmer/component';
import { tracked } from 'tracked-built-ins';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { waitForPromise } from '@ember/test-waiters';
import { action } from '@ember/object';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import parseError from 'irene/utils/parse-error';
import type { KnoxIqStatusCardState } from 'irene/components/knox-iq/status-card';
import type LoggerService from 'irene/services/logger';
import type MeService from 'irene/services/me';
import type FileModel from 'irene/models/file';
import type { FileDetailsAnalysesProviderContext } from './analyses-provider';
import type KnoxiqScanModel from 'irene/models/knoxiq-scan';
import type KnoxiqScanService from 'irene/services/knoxiq-scan';

export type KnoxiqScanStatusByType = Record<number, number>;

interface KnoxiqStatusCardConfig {
  title?: string;
  subtitle?: string;
  state: KnoxIqStatusCardState;
}

interface KnoxiqStatusCardTemplate {
  titleKey?: string;
  subtitleKey?: string;
  state: KnoxIqStatusCardState;
}

const KNOXIQ_STATUS_CARDS = {
  running: {
    titleKey: 'knoxIq.statusCard.statusTitle',
    state: 'running',
  },
  completed: {
    titleKey: 'knoxIq.statusCard.statusTitle',
    state: 'completed',
  },
  ready: {
    titleKey: 'knoxIq.statusCard.readyTitle',
    subtitleKey: 'knoxIq.statusCard.readySubtitle',
    state: 'active',
  },
  'dast-ready': {
    titleKey: 'knoxIq.statusCard.readyTitle',
    subtitleKey: 'knoxIq.statusCard.dastReadySubtitle',
    state: 'active',
  },
  'dast-and-api-ready': {
    titleKey: 'knoxIq.statusCard.readyTitle',
    subtitleKey: 'knoxIq.statusCard.dastAndApiReadySubtitle',
    state: 'active',
  },
  'complete-dast': {
    titleKey: 'knoxIq.statusCard.completeDastTitle',
    subtitleKey: 'knoxIq.statusCard.completeDastSubtitle',
    state: 'inactive',
  },
  'complete-api': {
    titleKey: 'knoxIq.statusCard.completeApiTitle',
    subtitleKey: 'knoxIq.statusCard.completeApiSubtitle',
    state: 'inactive',
  },
  'api-ready': {
    titleKey: 'knoxIq.statusCard.readyTitle',
    subtitleKey: 'knoxIq.statusCard.apiReadySubtitle',
    state: 'active',
  },
  'api-scan-disabled': {
    titleKey: 'knoxIq.statusCard.apiScanDisabledTitle',
    subtitleKey: 'knoxIq.statusCard.apiScanDisabledSubtitle',
    state: 'inactive',
  },
  failed: {
    titleKey: 'knoxIq.statusCard.failedTitle',
    subtitleKey: 'knoxIq.statusCard.failedSubtitle',
    state: 'failed',
  },
} satisfies Record<string, KnoxiqStatusCardTemplate>;

export interface FileDetailsSignature {
  Args: {
    file: FileModel;
    fileAnalysesListContext: FileDetailsAnalysesProviderContext;
  };
}

export default class FileDetailsComponent extends Component<FileDetailsSignature> {
  @service declare logger: LoggerService;
  @service declare me: MeService;
  @service declare intl: IntlService;
  @service('knoxiq-scan') declare knoxiqScanService: KnoxiqScanService;
  @service('notifications') declare notify: NotificationService;

  @tracked knoxiqScan: KnoxiqScanModel | null = null;

  constructor(owner: unknown, args: FileDetailsSignature['Args']) {
    super(owner, args);

    if (this.canFetchKnoxiqData) {
      this.fetchKnoxiqFileScans.perform();
    }
  }

  /**
   * The file's own org's KnoxIQ flag, not the viewer's. Superusers bypass
   * this only for viewing results (see `canFetchKnoxiqData`), not triggers.
   */
  get isKnoxiqEnabled() {
    if (this.args.file.isLegacyKnoxIQScan) {
      return false;
    }

    return Boolean(
      this.args.file.project?.get('organization')?.get('aiFeatures')?.knoxiq
    );
  }

  /** Independent sub-toggle of isKnoxiqEnabled (mirrors mycroft's _trigger_scan gate). */
  get isKnoxiqApiScanEnabled() {
    return Boolean(
      this.args.file.project?.get('organization')?.get('aiFeatures')
        ?.knoxiq_api_scan
    );
  }

  get isSuperuser() {
    return Boolean(this.me.org?.is_superuser);
  }

  /** Lets a superuser fetch KnoxIQ results for a client file even though their own org has it off. */
  get canFetchKnoxiqData() {
    return (
      this.isKnoxiqEnabled ||
      (this.isSuperuser && Boolean(this.args.file.isKnoxiqEnabled))
    );
  }

  /** Display-only KnoxIQ UI; unlike trigger UI, shows for superusers too once status loads. */
  get showKnoxiqScanStatus() {
    return this.isKnoxiqEnabled || this.hasKnoxiqScanStatusLoaded;
  }

  get knoxiqScanRecord() {
    return this.knoxiqScan;
  }

  get knoxiqScanStatuses(): KnoxiqScanStatusByType {
    const record = this.knoxiqScanRecord;

    if (!record) {
      return {};
    }

    return {
      [ENUMS.KNOXIQ_SCAN_TYPE.SAST]: record.sastStatus,
      [ENUMS.KNOXIQ_SCAN_TYPE.DAST_MANUAL]: record.dastStatus,
      [ENUMS.KNOXIQ_SCAN_TYPE.API]: record.apiStatus,
    };
  }

  get hasKnoxiqScanStatusLoaded() {
    return (
      this.canFetchKnoxiqData &&
      this.fetchKnoxiqFileScans.isIdle &&
      this.knoxiqScanRecord != null
    );
  }

  get showKnoxiqFileDetails() {
    if (!this.hasKnoxiqScanStatusLoaded) {
      return false;
    }

    const { NOT_TRIGGERED, DISABLED } = ENUMS.KNOXIQ_SCAN_STATUS;

    return Object.values(this.knoxiqScanStatuses).some(
      (status) => status !== NOT_TRIGGERED && status !== DISABLED
    );
  }

  get hasAnyKnoxiqScanCompleted() {
    return Object.values(this.knoxiqScanStatuses).includes(
      ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED
    );
  }

  /** Underway is enough to switch tables; unscored rows fill in as verdicts arrive. */
  get hasAnyKnoxiqScanStarted() {
    const { PENDING, RUNNING, COMPLETED } = ENUMS.KNOXIQ_SCAN_STATUS;

    return Object.values(this.knoxiqScanStatuses).some(
      (status) =>
        status === PENDING || status === RUNNING || status === COMPLETED
    );
  }

  get sastKnoxiqStatus() {
    return (
      this.knoxiqScanRecord?.sastStatus ??
      ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED
    );
  }

  get dastKnoxiqStatus() {
    return (
      this.knoxiqScanRecord?.dastStatus ??
      ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED
    );
  }

  get apiKnoxiqStatus() {
    return (
      this.knoxiqScanRecord?.apiStatus ?? ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED
    );
  }

  get knoxiqStatusCardConfig(): KnoxiqStatusCardConfig | null {
    if (
      this.args.file.isKnoxiqAutomated ||
      !this.canFetchKnoxiqData ||
      !this.fetchKnoxiqFileScans.isIdle ||
      !this.hasKnoxiqScanStatusLoaded
    ) {
      return null;
    }

    const sastStatus = this.sastKnoxiqStatus;
    const dastStatus = this.dastKnoxiqStatus;
    const apiStatus = this.apiKnoxiqStatus;

    return (
      this.knoxiqProgressCard(sastStatus, dastStatus, apiStatus) ??
      this.knoxiqReadyCard(sastStatus, dastStatus, apiStatus)
    );
  }

  /** Failed / running / completed — states independent of the trigger gate below. */
  private knoxiqProgressCard(
    sastStatus: number,
    dastStatus: number,
    apiStatus: number
  ): KnoxiqStatusCardConfig | null {
    const { RUNNING, PENDING, ERRORED } = ENUMS.KNOXIQ_SCAN_STATUS;

    if (
      sastStatus === ERRORED ||
      dastStatus === ERRORED ||
      apiStatus === ERRORED
    ) {
      return this.buildKnoxiqStatusCard(KNOXIQ_STATUS_CARDS.failed);
    }

    const isKnoxiqRunning = (status: number) =>
      status === RUNNING || status === PENDING;

    if (
      isKnoxiqRunning(sastStatus) ||
      isKnoxiqRunning(dastStatus) ||
      isKnoxiqRunning(apiStatus)
    ) {
      return this.buildKnoxiqStatusCard(KNOXIQ_STATUS_CARDS.running);
    }

    if (this.isKnoxiqFullyCompleted(sastStatus, dastStatus, apiStatus)) {
      return this.buildKnoxiqStatusCard(KNOXIQ_STATUS_CARDS.completed);
    }

    return null;
  }

  // API_SCAN_DISABLED is excluded from isApiSettled on purpose — it has its
  // own dedicated card in knoxiqReadyCard, checked regardless of sast/dast.
  private isKnoxiqFullyCompleted(
    sastStatus: number,
    dastStatus: number,
    apiStatus: number
  ): boolean {
    const { DISABLED, COMPLETED } = ENUMS.KNOXIQ_SCAN_STATUS;

    const isApiSettled = this.isKnoxiqApiScanEnabled
      ? apiStatus === COMPLETED
      : !this.args.file.isApiDone || apiStatus === COMPLETED;
    const isSastSettled = sastStatus === COMPLETED || sastStatus === DISABLED;
    const isDastSettled = dastStatus === COMPLETED || dastStatus === DISABLED;
    const hasCompletedScan =
      sastStatus === COMPLETED ||
      dastStatus === COMPLETED ||
      apiStatus === COMPLETED;

    return isSastSettled && isDastSettled && isApiSettled && hasCompletedScan;
  }

  // Ready/nudge states — gated on the real org flag so a superuser never
  // sees a "run KnoxIQ" CTA the backend would reject.
  private knoxiqReadyCard(
    sastStatus: number,
    dastStatus: number,
    apiStatus: number
  ): KnoxiqStatusCardConfig | null {
    if (!this.isKnoxiqEnabled) {
      return null;
    }

    return (
      this.knoxiqFirstRunReadyCard(sastStatus, dastStatus, apiStatus) ??
      this.knoxiqNudgeCard(sastStatus, dastStatus, apiStatus)
    );
  }

  // "Nothing run yet, here's what to trigger" states.
  private knoxiqFirstRunReadyCard(
    sastStatus: number,
    dastStatus: number,
    apiStatus: number
  ): KnoxiqStatusCardConfig | null {
    const { NOT_TRIGGERED, DISABLED, COMPLETED } = ENUMS.KNOXIQ_SCAN_STATUS;

    if (this.args.file.isStaticDone && sastStatus === NOT_TRIGGERED) {
      return this.buildKnoxiqStatusCard(KNOXIQ_STATUS_CARDS.ready);
    }

    const isDastDone =
      this.args.file.isManualDone || this.args.file.isDynamicDone;
    const isDastNotRun =
      dastStatus === NOT_TRIGGERED || dastStatus === DISABLED;
    const isDastKnoxiqReady =
      sastStatus === COMPLETED && isDastDone && isDastNotRun;
    const isApiKnoxiqReady =
      this.args.file.isApiDone && apiStatus === NOT_TRIGGERED;

    // Checked first: triggerKnoxiqScan() runs both types together, so the
    // card must say so when both are waiting, not just name DAST.
    if (isDastKnoxiqReady && isApiKnoxiqReady) {
      return this.buildKnoxiqStatusCard(
        KNOXIQ_STATUS_CARDS['dast-and-api-ready']
      );
    }

    if (isDastKnoxiqReady) {
      return this.buildKnoxiqStatusCard(KNOXIQ_STATUS_CARDS['dast-ready']);
    }

    if (isApiKnoxiqReady) {
      const hasAnyKnoxiqRunCompleted =
        sastStatus === COMPLETED || dastStatus === COMPLETED;

      return this.buildKnoxiqStatusCard(
        hasAnyKnoxiqRunCompleted
          ? KNOXIQ_STATUS_CARDS['api-ready']
          : KNOXIQ_STATUS_CARDS.ready
      );
    }

    return null;
  }

  // "Something already ran, here's what's left" states — checked only once
  // no first-run card above matched, so an API-ready file still wins there first.
  private knoxiqNudgeCard(
    sastStatus: number,
    dastStatus: number,
    apiStatus: number
  ): KnoxiqStatusCardConfig | null {
    const { NOT_TRIGGERED, DISABLED, COMPLETED, API_SCAN_DISABLED } =
      ENUMS.KNOXIQ_SCAN_STATUS;

    // Sub-feature is off for this org — not "ready to trigger".
    if (this.args.file.isApiDone && apiStatus === API_SCAN_DISABLED) {
      return this.buildKnoxiqStatusCard(
        KNOXIQ_STATUS_CARDS['api-scan-disabled']
      );
    }

    const isDastNotRun =
      dastStatus === NOT_TRIGGERED || dastStatus === DISABLED;

    if (sastStatus === COMPLETED && isDastNotRun) {
      return this.buildKnoxiqStatusCard(KNOXIQ_STATUS_CARDS['complete-dast']);
    }

    // Mirrors complete-dast; gated on the API sub-toggle since API scan can
    // be off independently of KnoxIQ (doesn't yet track per-scan re-runs).
    if (
      sastStatus === COMPLETED &&
      this.isKnoxiqApiScanEnabled &&
      !this.args.file.isApiDone
    ) {
      return this.buildKnoxiqStatusCard(KNOXIQ_STATUS_CARDS['complete-api']);
    }

    return null;
  }

  @action buildKnoxiqStatusCard(
    template: KnoxiqStatusCardTemplate
  ): KnoxiqStatusCardConfig {
    return {
      title: template.titleKey ? this.intl.t(template.titleKey) : undefined,
      subtitle: template.subtitleKey
        ? this.intl.t(template.subtitleKey)
        : undefined,
      state: template.state,
    };
  }

  @action
  runKnoxiqScan() {
    this.triggerKnoxiqScan.perform();
  }

  triggerKnoxiqScan = task(async () => {
    try {
      await waitForPromise(this.args.file.triggerKnoxiqScan());
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });

  fetchKnoxiqFileScans = task(async () => {
    if (!this.canFetchKnoxiqData) {
      return;
    }

    try {
      this.knoxiqScan = await waitForPromise(
        this.knoxiqScanService.fetch(this.args.file.id)
      );
    } catch (error) {
      // Superuser probing a file with no KnoxIQ history yet — fail quietly.
      const isExpectedDenial =
        this.isSuperuser &&
        !this.isKnoxiqEnabled &&
        (error as { errors?: { status?: string }[] })?.errors?.[0]?.status ===
          '403';

      if (isExpectedDenial) {
        return;
      }

      this.notify.error(parseError(error));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    FileDetails: typeof FileDetailsComponent;
  }
}
