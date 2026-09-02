import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { htmlSafe } from '@ember/template';
import { task } from 'ember-concurrency';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

import parseError from 'irene/utils/parse-error';
import type OffsecFindingModel from 'irene/models/offsec-finding';

export type FindingDetailTab = 'finding' | 'exploitation';

export interface OffensiveSecurityFindingDetailSignature {
  Args: {
    scanId: string;
    findingId: string;
  };
}

export default class OffensiveSecurityFindingDetailComponent extends Component<OffensiveSecurityFindingDetailSignature> {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service declare router: RouterService;
  @service('notifications') declare notify: NotificationService;

  @tracked finding: OffsecFindingModel | null = null;
  @tracked activeTab: FindingDetailTab = 'finding';

  constructor(
    owner: unknown,
    args: OffensiveSecurityFindingDetailSignature['Args']
  ) {
    super(owner, args);

    this.loadFinding.perform(args.findingId);
  }

  get isLoading(): boolean {
    return this.loadFinding.isRunning;
  }

  get isFindingTab(): boolean {
    return this.activeTab === 'finding';
  }

  get evidence() {
    return this.finding?.evidenceList ?? [];
  }

  get checkTypeLabel(): string {
    if (!this.finding?.checkType) {
      return 'Findings';
    }
    return this.finding.checkType
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  get scoreProgressStyle() {
    const rawScore = this.finding?.score;
    const scoreVal =
      typeof rawScore === 'number'
        ? rawScore
        : parseInt(String(rawScore || '10'), 10);
    const validScore = isNaN(scoreVal)
      ? 10
      : Math.max(0, Math.min(100, scoreVal));
    return htmlSafe(`width: ${validScore}%;`);
  }

  /** Labels the technique block honestly — attempted is not the same as used. */
  get techniqueLabel(): string {
    if (!this.finding) {
      return '';
    }

    if (this.finding.isResisted) {
      return this.intl.t('offensiveSecurity.techniqueAttempted');
    }

    if (!this.finding.wasAttempted) {
      return this.intl.t('offensiveSecurity.techniqueStaged');
    }

    return this.intl.t('offensiveSecurity.techniqueUsed');
  }

  @tracked expandedEvidenceId: string | number | null = null;

  @action
  setTab(tab: FindingDetailTab): void {
    this.activeTab = tab;
  }

  @action
  selectFindingTab(): void {
    this.activeTab = 'finding';
  }

  @action
  selectExploitationTab(): void {
    this.activeTab = 'exploitation';
  }

  @action
  toggleEvidencePayload(id: string | number): void {
    if (this.expandedEvidenceId === id) {
      this.expandedEvidenceId = null;
    } else {
      this.expandedEvidenceId = id;
    }
  }

  @action
  formatPayload(content: unknown): string {
    if (!content) {
      return '';
    }

    if (typeof content === 'string') {
      try {
        const parsed = JSON.parse(content);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return content;
      }
    }

    return JSON.stringify(content, null, 2);
  }

  @tracked isCopied = false;

  @action
  copySha(text: string): void {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      this.isCopied = true;
      setTimeout(() => {
        this.isCopied = false;
      }, 2000);
    }
  }

  @action
  goBackToScan(): void {
    const scanId = this.args.scanId || (this.finding as any)?.scan_id;
    if (scanId) {
      this.router.transitionTo(
        'authenticated.dashboard.offensive-security.scan',
        scanId
      );
    } else {
      window.history.back();
    }
  }

  loadFinding = task({ drop: true }, async (findingId: string) => {
    try {
      this.finding = (await this.store.findRecord('offsec-finding', findingId, {
        reload: true,
      })) as OffsecFindingModel;
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));

      this.goBackToScan();
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::FindingDetail': typeof OffensiveSecurityFindingDetailComponent;
    'offensive-security/finding-detail': typeof OffensiveSecurityFindingDetailComponent;
  }
}
