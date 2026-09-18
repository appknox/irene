import Component from '@glimmer/component';
import { tracked } from 'tracked-built-ins';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { waitForPromise } from '@ember/test-waiters';
import { action } from '@ember/object';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import parseError from 'irene/utils/parse-error';
import type { KnoxIqStatusCardState } from 'irene/components/knox-iq/status-card';
import type LoggerService from 'irene/services/logger';
import type MeService from 'irene/services/me';
import type FileModel from 'irene/models/file';
import type { FileDetailsAnalysesProviderContext } from './analyses-provider';
import type KnoxiqScanModel from 'irene/models/knoxiq-scan';

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
  'complete-dast': {
    titleKey: 'knoxIq.statusCard.completeDastTitle',
    subtitleKey: 'knoxIq.statusCard.completeDastSubtitle',
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
  @service declare store: Store;
  @service declare logger: LoggerService;
  @service declare me: MeService;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked knoxiqScan: KnoxiqScanModel | null = null;

  constructor(owner: unknown, args: FileDetailsSignature['Args']) {
    super(owner, args);

    if (this.canFetchKnoxiqData) {
      this.fetchKnoxiqFileScans.perform();
    }
  }

  /**
   * The file's own org's KnoxIQ setting — resolved from the file itself,
   * not the viewing user's org, since a superuser's own org has nothing
   * to do with whether this file's org has KnoxIQ on. Trigger-related UI
   * stays gated on this strict flag even for superusers; only viewing
   * already-produced results is bypassable (see `canFetchKnoxiqData`).
   *
   * Known limitation: for a file in an org the viewer doesn't belong to,
   * `project.organization` may not resolve (fetching another org's record
   * is scoped to the requester's own orgs), so this can read `false` even
   * when that org's flag is genuinely on. That only suppresses the
   * trigger-prompt UI for a not-yet-triggered cross-org file — a missing
   * affordance, not a security issue — and is out of scope for the
   * viewing-existing-results problem this fix targets.
   */
  get isKnoxiqEnabled() {
    if (this.args.file.isLegacyKnoxIQScan) {
      return false;
    }

    return Boolean(
      this.args.file.project?.get('organization')?.get('aiFeatures')?.knoxiq
    );
  }

  get isSuperuser() {
    return Boolean(this.me.org?.is_superuser);
  }

  /**
   * A superuser may still view KnoxIQ results already produced for a file
   * even after the file's org disables KnoxIQ. The backend enforces the
   * same rule (and denies when no such data exists yet), so it's safe to
   * always attempt the fetch here and let a 403 fail quietly.
   */
  get canFetchKnoxiqData() {
    return this.isKnoxiqEnabled || this.isSuperuser;
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

  get sastKnoxiqStatus() {
    return this.knoxiqScanRecord?.sastStatus;
  }

  get dastKnoxiqStatus() {
    return this.knoxiqScanRecord?.dastStatus;
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
    const { DISABLED, NOT_TRIGGERED, PENDING, RUNNING, COMPLETED, ERRORED } =
      ENUMS.KNOXIQ_SCAN_STATUS;

    if (sastStatus === ERRORED || dastStatus === ERRORED) {
      return this.buildKnoxiqStatusCard(KNOXIQ_STATUS_CARDS.failed);
    }

    const isKnoxiqRunning = (status: number | undefined) =>
      status === RUNNING || status === PENDING;

    if (isKnoxiqRunning(sastStatus) || isKnoxiqRunning(dastStatus)) {
      return this.buildKnoxiqStatusCard(KNOXIQ_STATUS_CARDS.running);
    }

    if (sastStatus === COMPLETED && dastStatus === COMPLETED) {
      return this.buildKnoxiqStatusCard(KNOXIQ_STATUS_CARDS.completed);
    }

    // Everything below here prompts the viewer to trigger a scan, which
    // stays gated by the org's real flag -- a superuser viewing another
    // org's already-produced results must never see a "run KnoxIQ" CTA
    // the backend would reject.
    if (!this.isKnoxiqEnabled) {
      return null;
    }

    if (this.args.file.isStaticDone && sastStatus === NOT_TRIGGERED) {
      return this.buildKnoxiqStatusCard(KNOXIQ_STATUS_CARDS.ready);
    }

    if (
      sastStatus === COMPLETED &&
      (dastStatus === NOT_TRIGGERED || dastStatus === DISABLED)
    ) {
      const isDastDone =
        this.args.file.isManualDone || this.args.file.isDynamicDone;

      return this.buildKnoxiqStatusCard(
        isDastDone
          ? KNOXIQ_STATUS_CARDS['dast-ready']
          : KNOXIQ_STATUS_CARDS['complete-dast']
      );
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
        this.store.queryRecord('knoxiq-scan', {
          id: this.args.file.id,
          fileId: this.args.file.id,
        })
      );
    } catch (error) {
      // A superuser probing another org's file that has no KnoxIQ history
      // yet is expected to be denied here -- fail quietly instead of
      // toasting an error for what is really just "nothing to show".
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
