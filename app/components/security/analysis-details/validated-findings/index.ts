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
import type SecurityValidatedFindingModel from 'irene/models/security/validated-finding';

import {
  SECURITY_VALIDATED_FINDING_PANEL,
  type SecurityValidatedFindingPanelId,
} from './finding-detail';

export const SECURITY_ANALYSIS_FINDINGS_LIMIT = 20;

const FINDINGS_QUERY_LIMIT = 50;
const FINDINGS_QUERY_OFFSET = 0;

export interface SecurityValidatedFindingPositionOption {
  position: number;
  label: string;
  finding: SecurityValidatedFindingModel;
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

  @tracked findings: SecurityValidatedFindingModel[] = [];
  @tracked selectedFinding: SecurityValidatedFindingModel | null = null;
  @tracked openPanels: SecurityValidatedFindingPanelId[] = [];

  @tracked showOriginalAnalysis = false;
  @tracked showDeleteFindingConfirm = false;
  @tracked showDeleteAllFindingsConfirm = false;
  @tracked moreMenuRef: HTMLElement | null = null;

  readonly allPanelIds = Object.values(SECURITY_VALIDATED_FINDING_PANEL);

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

  get findingPositionOptions(): SecurityValidatedFindingPositionOption[] {
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
  isPanelOpen(panel: SecurityValidatedFindingPanelId) {
    return this.openPanels.includes(panel);
  }

  @action
  togglePanel(panel: SecurityValidatedFindingPanelId) {
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
  selectFindingPosition(option: SecurityValidatedFindingPositionOption) {
    this.selectedFinding = option?.finding ?? this.selectedFinding;
  }

  @action
  addFinding() {
    this.createFinding.perform();
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
  openOriginalAnalysis() {
    this.closeMoreMenu();
    this.showOriginalAnalysis = true;
  }

  @action
  closeOriginalAnalysis() {
    this.showOriginalAnalysis = false;
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
    this.deleteFindings.perform(
      this.selectedFinding ? [this.selectedFinding] : []
    );
  }

  @action
  deleteAllFindings() {
    this.deleteFindings.perform([...this.findings]);
  }

  @action
  saveSelectedFinding() {
    this.saveFinding.perform();
  }

  @action
  savePanel() {
    this.saveFinding.perform();
  }

  // Every write is addressed through the analysis, which is not part of the
  // finding payload.
  get adapterOptions() {
    return { analysisId: String(this.analysis?.id) };
  }

  get isSaving() {
    return (
      this.saveFinding.isRunning ||
      this.createFinding.isRunning ||
      this.deleteFindings.isRunning
    );
  }

  fetchFindings = task(async () => {
    try {
      const findings = await waitForPromise(
        this.store.query('security/validated-finding', {
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

  // POST creates the row before the editor opens, because the API assigns the
  // finding_id and the database id the later saves are addressed by.
  createFinding = task({ drop: true }, async () => {
    if (this.hasReachedFindingsLimit) {
      return;
    }

    const finding = this.store.createRecord('security/validated-finding');

    try {
      await finding.save({ adapterOptions: this.adapterOptions });

      this.findings = [...this.findings, finding];
      this.selectedFinding = finding;
    } catch (error) {
      finding.unloadRecord();

      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });

  saveFinding = task({ drop: true }, async () => {
    try {
      await this.selectedFinding?.save({
        adapterOptions: this.adapterOptions,
      });

      this.notify.success(
        this.intl.t('securityAnalysisDetails.validatedFindings.findingSaved')
      );
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });

  deleteFindings = task(
    { drop: true },
    async (findings: SecurityValidatedFindingModel[]) => {
      try {
        for (const finding of findings) {
          await finding.destroyRecord({
            adapterOptions: this.adapterOptions,
          });
        }

        this.findings = this.findings.filter(
          (finding) => !findings.includes(finding)
        );

        this.selectedFinding = this.findings[0] ?? null;
      } catch (error) {
        this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
      } finally {
        this.showDeleteFindingConfirm = false;
        this.showDeleteAllFindingsConfirm = false;
      }
    }
  );
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::ValidatedFindings': typeof SecurityAnalysisDetailsValidatedFindingsComponent;
  }
}
