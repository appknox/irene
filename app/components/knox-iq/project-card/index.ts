import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';
import type Store from 'ember-data/store';

import parseError from 'irene/utils/parse-error';
import type FileModel from 'irene/models/file';
import type ProjectModel from 'irene/models/project';
import type FileExploitabilityModel from 'irene/models/file-exploitability';

export type KnoxIqProjectCardAccent = 'pending' | 'done' | 'legacy';

const ACCENT_CSS_VAR_MAP: Record<KnoxIqProjectCardAccent, string> = {
  pending: '--knoxiq-card-accent-pending',
  done: '--knoxiq-card-accent-completed',
  legacy: '--knoxiq-card-accent-legacy',
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

  get project() {
    const projectId = this.args.file?.project?.get('id');

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
    if (this.args.file == null || this.args.file.isLegacyKnoxIQScan) {
      return 'legacy';
    }

    if (this.args.file?.isCompletedKnoxIQScan) {
      return 'done';
    }

    return 'pending';
  }

  get resolvedAccentColor(): KnoxIqProjectCardAccent {
    return this.args.accentColor ?? this.derivedAccentColor;
  }

  get accentCssColor() {
    return getComputedStyle(document.body).getPropertyValue(
      ACCENT_CSS_VAR_MAP[this.resolvedAccentColor]
    );
  }

  get isLegacy() {
    return this.args.file?.isLegacyKnoxIQScan ?? false;
  }

  get isErrored() {
    return this.args.file?.isErroredKnoxIQScan ?? false;
  }

  get shouldShowRunKnoxIq() {
    if (this.args.showRunKnoxIq !== undefined) {
      return this.args.showRunKnoxIq;
    }

    const isErrored = this.args.file?.isErroredKnoxIQScan ?? false;

    if (this.args.file?.isKnoxiqAutomated) {
      return isErrored;
    }

    return isErrored || (this.args.file?.isNotTriggeredKnoxIQScan ?? false);
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
