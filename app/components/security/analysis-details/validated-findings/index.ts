import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';

import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';

import styles from './index.scss';

import type SecurityAnalysisModel from 'irene/models/security/analysis';
import type SecurityAnalysisFindingModel from 'irene/models/security/analysis-finding';

import {
  SECURITY_ANALYSIS_FINDING_PANEL,
  type SecurityAnalysisFindingPanelId,
} from './finding-detail';

export const SECURITY_ANALYSIS_FINDINGS_LIMIT = 20;

const FINDINGS_QUERY_LIMIT = 50;
const FINDINGS_QUERY_OFFSET = 0;

export interface SecurityAnalysisFindingPositionOption {
  position: number;
  label: string;
  finding: SecurityAnalysisFindingModel;
}

export interface SecurityAnalysisDetailsValidatedFindingsSignature {
  Args: {
    analysis: SecurityAnalysisModel | null;
  };
}

export default class SecurityAnalysisDetailsValidatedFindingsComponent extends Component<SecurityAnalysisDetailsValidatedFindingsSignature> {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked findings: SecurityAnalysisFindingModel[] = [];
  @tracked selectedFinding: SecurityAnalysisFindingModel | null = null;
  @tracked openPanels: SecurityAnalysisFindingPanelId[] = [];

  @tracked showDeleteFindingConfirm = false;
  @tracked showDeleteAllFindingsConfirm = false;
  @tracked moreMenuRef: HTMLElement | null = null;

  readonly allPanelIds = Object.values(SECURITY_ANALYSIS_FINDING_PANEL);

  constructor(
    owner: unknown,
    args: SecurityAnalysisDetailsValidatedFindingsSignature['Args']
  ) {
    super(owner, args);

    this.fetchFindings.perform();
  }

  get classes() {
    return { menuItemText: styles['menu-item-text'] };
  }

  get analysis() {
    return this.args.analysis;
  }

  get isPassed() {
    return Boolean(this.analysis?.isPassed);
  }

  get isLoading() {
    return this.fetchFindings.isRunning;
  }

  get hasFindings() {
    return this.findings.length > 0;
  }

  get selectedIndex() {
    if (!this.selectedFinding) {
      return -1;
    }

    return this.findings.indexOf(this.selectedFinding);
  }

  get isFirstFinding() {
    return this.selectedIndex <= 0;
  }

  get isLastFinding() {
    return (
      this.selectedIndex < 0 || this.selectedIndex >= this.findings.length - 1
    );
  }

  get formattedTotalFindings() {
    return String(this.findings.length).padStart(2, '0');
  }

  get findingPositionOptions(): SecurityAnalysisFindingPositionOption[] {
    return this.findings.map((finding, index) => ({
      position: index + 1,
      label: String(index + 1).padStart(2, '0'),
      finding,
    }));
  }

  get selectedFindingPositionOption() {
    return this.findingPositionOptions[this.selectedIndex] ?? null;
  }

  get hasReachedFindingsLimit() {
    return this.findings.length >= SECURITY_ANALYSIS_FINDINGS_LIMIT;
  }

  get addFindingTooltip() {
    return this.hasReachedFindingsLimit
      ? this.intl.t('securityAnalysisDetails.validatedFindings.limitReached', {
          limit: SECURITY_ANALYSIS_FINDINGS_LIMIT,
        })
      : '';
  }

  get isLastRemainingFinding() {
    return this.findings.length <= 1;
  }

  get deleteDisabledReason() {
    return this.isLastRemainingFinding
      ? this.intl.t(
          'securityAnalysisDetails.validatedFindings.atLeastOneRequired'
        )
      : '';
  }

  get areAllPanelsOpen() {
    return this.allPanelIds.every((panel) => this.openPanels.includes(panel));
  }

  @action
  isPanelOpen(panel: SecurityAnalysisFindingPanelId) {
    return this.openPanels.includes(panel);
  }

  @action
  togglePanel(panel: SecurityAnalysisFindingPanelId) {
    this.openPanels = this.openPanels.includes(panel)
      ? this.openPanels.filter((id) => id !== panel)
      : [...this.openPanels, panel];
  }

  @action
  toggleExpandAll() {
    this.openPanels = this.areAllPanelsOpen ? [] : [...this.allPanelIds];
  }

  @action
  goToPreviousFinding() {
    this.selectedFinding =
      this.findings[this.selectedIndex - 1] ?? this.selectedFinding;
  }

  @action
  goToNextFinding() {
    this.selectedFinding =
      this.findings[this.selectedIndex + 1] ?? this.selectedFinding;
  }

  @action
  selectFindingPosition(option: SecurityAnalysisFindingPositionOption) {
    this.selectedFinding = option?.finding ?? this.selectedFinding;
  }

  @action
  addFinding() {
    if (this.hasReachedFindingsLimit) {
      return;
    }

    const finding = this.store.createRecord('security/analysis-finding', {
      validation: {
        confidence_label: '',
        finding_summary: '',
        evidence: '',
        reasoning: '',
      },
      remediation: { steps: [] },
      poc: { steps: [] },
      exploitability: {
        exploitability_likelihood: '',
        exploitability_analysis: { body: '' },
      },
    });

    this.findings = [...this.findings, finding];
    this.selectedFinding = finding;
  }

  @action
  openMoreMenu(event: MouseEvent) {
    this.moreMenuRef = event.currentTarget as HTMLElement;
  }

  @action
  closeMoreMenu() {
    this.moreMenuRef = null;
  }

  @action
  openDeleteFindingConfirm() {
    this.closeMoreMenu();
    this.showDeleteFindingConfirm = true;
  }

  @action
  closeDeleteFindingConfirm() {
    this.showDeleteFindingConfirm = false;
  }

  @action
  openDeleteAllFindingsConfirm() {
    this.closeMoreMenu();
    this.showDeleteAllFindingsConfirm = true;
  }

  @action
  closeDeleteAllFindingsConfirm() {
    this.showDeleteAllFindingsConfirm = false;
  }

  @action
  deleteSelectedFinding() {
    const remaining = this.findings.filter(
      (finding) => finding !== this.selectedFinding
    );

    this.findings = remaining;
    this.selectedFinding = remaining[0] ?? null;
    this.showDeleteFindingConfirm = false;
  }

  @action
  deleteAllFindings() {
    this.findings = [];
    this.selectedFinding = null;
    this.showDeleteAllFindingsConfirm = false;
  }

  @action
  saveSelectedFinding() {
    this.saveFinding.perform();
  }

  @action
  savePanel() {
    this.saveFinding.perform();
  }

  fetchFindings = task(async () => {
    try {
      const findings = await waitForPromise(
        this.store.query('security/analysis-finding', {
          analysisId: this.analysis?.id,
          limit: FINDINGS_QUERY_LIMIT,
          offset: FINDINGS_QUERY_OFFSET,
        })
      );

      this.findings = findings.slice();
      this.selectedFinding = this.findings[0] ?? null;
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });

  saveFinding = task(async () => {
    try {
      await this.selectedFinding?.save();

      this.notify.success(
        this.intl.t('securityAnalysisDetails.validatedFindings.findingSaved')
      );
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::ValidatedFindings': typeof SecurityAnalysisDetailsValidatedFindingsComponent;
  }
}
