import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';
import type Store from 'ember-data/store';

import ENUMS from 'irene/enums';
import parseError from 'irene/utils/parse-error';
import type FileModel from 'irene/models/file';
import type ProjectModel from 'irene/models/project';
import type FileExploitabilityModel from 'irene/models/file-exploitability';

export type KnoxIqProjectCardAccent = 'pending' | 'done' | 'legacy';

const ACCENT_COLOR_MAP: Record<KnoxIqProjectCardAccent, string> = {
  pending: 'var(--knoxiq-card-accent-pending)',
  done: 'var(--knoxiq-card-accent-completed)',
  legacy: 'var(--knoxiq-card-accent-legacy)',
};

interface KnoxIqProjectCardSignature {
  Element: HTMLElement;
  Args: {
    file: FileModel | null;
    isSelectedFile?: boolean;
    showCheckbox?: boolean;
    disableCheckbox?: boolean;
    onFileSelect?: (file: FileModel | null) => void;
    showMenuButton?: boolean;
    showRunKnoxIq?: boolean;
    showOpenInNewTab?: boolean;
    accentColor?: KnoxIqProjectCardAccent;
  };
}

export default class KnoxIqProjectCardComponent extends Component<KnoxIqProjectCardSignature> {
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked fileExploitability: FileExploitabilityModel | null = null;

  constructor(owner: unknown, args: KnoxIqProjectCardSignature['Args']) {
    super(owner, args);

    this.fetchFileExploitability.perform();
  }

  get knoxiqStatus() {
    return this.args.file?.knoxiqStatus;
  }

  get project() {
    const projectId = this.args.file?.belongsTo('project').id();

    return projectId
      ? (this.store.peekRecord('project', projectId) as ProjectModel | null)
      : null;
  }

  get hasExploitabilityData() {
    const exploitability = this.fileExploitability;

    if (!exploitability) {
      return false;
    }

    return (
      (exploitability.exploitabilityCountHigh ?? 0) > 0 ||
      (exploitability.exploitabilityCountMedium ?? 0) > 0 ||
      (exploitability.exploitabilityCountLow ?? 0) > 0 ||
      (exploitability.exploitabilityCountPassed ?? 0) > 0
    );
  }

  get derivedAccentColor(): KnoxIqProjectCardAccent {
    const status = this.knoxiqStatus;

    if (status == null || status === ENUMS.KNOXIQ_SCAN_STATUS.LEGACY) {
      return 'legacy';
    }

    if (status === ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED) {
      return 'done';
    }

    return 'pending';
  }

  get resolvedAccentColor(): KnoxIqProjectCardAccent {
    return this.args.accentColor ?? this.derivedAccentColor;
  }

  get accentCssColor() {
    return ACCENT_COLOR_MAP[this.resolvedAccentColor];
  }

  get isLegacy() {
    if (this.resolvedAccentColor === 'legacy') {
      return true;
    }

    const status = this.knoxiqStatus;
    const { NOT_TRIGGERED, DISABLED } = ENUMS.KNOXIQ_SCAN_STATUS;

    // Treat as legacy when there's no exploitability data yet
    return (
      (status === NOT_TRIGGERED || status === DISABLED) &&
      !this.hasExploitabilityData
    );
  }

  get shouldShowRunKnoxIq() {
    if (this.args.showRunKnoxIq !== undefined) {
      return this.args.showRunKnoxIq;
    }

    const status = this.knoxiqStatus;
    const isErrored = status === ENUMS.KNOXIQ_SCAN_STATUS.ERRORED;

    if (this.args.file?.isKnoxiqAutomated) {
      return isErrored;
    }

    return isErrored || status === ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED;
  }

  @action
  runKnoxiqScan() {
    this.triggerKnoxiqScan.perform();
  }

  fetchFileExploitability = task(async () => {
    try {
      if (this.args.file) {
        this.fileExploitability = await waitForPromise(
          this.args.file.fetchFileExploitability()
        );
      }
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });

  triggerKnoxiqScan = task(async () => {
    if (!this.args.file) {
      return;
    }

    try {
      await waitForPromise(this.args.file.triggerKnoxiqScan());
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'KnoxIq::ProjectCard': typeof KnoxIqProjectCardComponent;
  }
}
