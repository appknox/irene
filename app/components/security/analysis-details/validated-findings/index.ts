import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';

import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';
import type { AkIconVariantType } from 'ak-icons';

import {
  UNKNOWN_SCALE_VALUE,
  buildPoc,
  buildRemediation,
  type SecurityValidatedFindingStep,
} from 'irene/utils/knoxiq-validated-findings';

import parseError from 'irene/utils/parse-error';

import type { AkIconColorVariant } from 'irene/components/ak-icon';
import type SecurityAnalysisModel from 'irene/models/security/analysis';
import type SecurityValidatedFindingModel from 'irene/models/security/validated-finding';

import {
  SECURITY_VALIDATED_FINDING_PANEL,
  type SecurityValidatedFindingPanelId,
} from './finding-detail';

import styles from './index.scss';

export const SECURITY_ANALYSIS_FINDINGS_LIMIT = 20;

// The fields a finding must carry before it is worth sending to the API.
// Score, vectors and the remediation prompt are left out: none is persisted yet.
export const SECURITY_VALIDATED_FINDING_REQUIRED_FIELDS = [
  'confidence',
  'summary',
  'reasoning',
  'remediationSteps',
  'stepsToReproduce',
  'exploitabilityLikelihood',
] as const;

export type SecurityValidatedFindingRequiredField =
  (typeof SECURITY_VALIDATED_FINDING_REQUIRED_FIELDS)[number];

const FINDINGS_QUERY_LIMIT = 50;
const FINDINGS_QUERY_OFFSET = 0;

export interface SecurityValidatedFindingMenuItem {
  id: string;
  labelKey: string;
  iconName: AkIconVariantType;
  iconColor: AkIconColorVariant;
  divider: boolean;
  disabled: boolean;
  title: string;
  onClick: () => void;
}

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
  @tracked remediationSteps: SecurityValidatedFindingStep[] = [];
  @tracked stepsToReproduce: SecurityValidatedFindingStep[] = [];
  // AEIS configuration is the first thing a reviewer sets, so it starts open.
  @tracked openPanels: SecurityValidatedFindingPanelId[] = [
    SECURITY_VALIDATED_FINDING_PANEL.AEIS,
  ];

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

  get areAllPanelsOpen() {
    return this.allPanelIds.every((panel) => this.openPanels.includes(panel));
  }

  get findingRequestOptions() {
    return { analysisId: String(this.analysis?.id) };
  }

  get isWritingFinding() {
    return this.saveFinding.isRunning || this.deleteFindings.isRunning;
  }

  /**
   * Lists the required fields the selected finding has not filled in yet.
   * Empty means it is complete enough to send.
   */
  get missingFields(): SecurityValidatedFindingRequiredField[] {
    const content = this.selectedFinding?.content;

    if (!content) {
      return [];
    }

    const isFilled: Record<SecurityValidatedFindingRequiredField, boolean> = {
      confidence: content.confidence !== UNKNOWN_SCALE_VALUE,
      summary: this.hasText(content.summary),
      reasoning: this.hasText(content.reasoning),
      remediationSteps: this.hasCompleteStep(content.remediationSteps),
      stepsToReproduce: this.hasCompleteStep(content.stepsToReproduce),
      exploitabilityLikelihood:
        content.exploitabilityLikelihood !== UNKNOWN_SCALE_VALUE,
    };

    return SECURITY_VALIDATED_FINDING_REQUIRED_FIELDS.filter(
      (field) => !isFilled[field]
    );
  }

  hasText(value: string) {
    return value.replace(/<[^>]*>/g, '').trim().length > 0;
  }

  hasCompleteStep(steps: SecurityValidatedFindingStep[]) {
    return steps.some(
      (step) => this.hasText(step.heading) || this.hasText(step.body)
    );
  }

  get isSelectedFindingComplete() {
    return this.missingFields.length === 0;
  }

  get missingFieldsMessage() {
    const fields = this.missingFields
      .map((field) =>
        this.intl.t(`securityAnalysisDetails.validatedFindings.field.${field}`)
      )
      .join(', ');

    return this.intl.t(
      'securityAnalysisDetails.validatedFindings.missingFields',
      { fields }
    );
  }

  get moreMenuItems(): SecurityValidatedFindingMenuItem[] {
    return [
      {
        id: 'originalAnalysis',
        labelKey: 'securityAnalysisDetails.validatedFindings.originalAnalysis',
        iconName: 'description-outline',
        iconColor: 'textPrimary',
        divider: true,
        disabled: false,
        title: '',
        onClick: this.openOriginalAnalysis,
      },
      {
        id: 'deleteFinding',
        labelKey: 'securityAnalysisDetails.validatedFindings.deleteThisFinding',
        iconName: 'delete-outline',
        iconColor: 'textPrimary',
        divider: true,
        disabled: this.isWritingFinding,
        title: '',
        onClick: this.openDeleteFindingConfirm,
      },
      {
        id: 'deleteAllFindings',
        labelKey:
          'securityAnalysisDetails.validatedFindings.deleteOverallFinding',
        iconName: 'delete-outline',
        iconColor: 'error',
        divider: false,
        disabled: this.isWritingFinding,
        title: '',
        onClick: this.openDeleteAllFindingsConfirm,
      },
    ];
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

  selectFinding(finding: SecurityValidatedFindingModel | null) {
    this.selectedFinding = finding;
    this.remediationSteps = finding?.remediationSteps ?? [];
    this.stepsToReproduce = finding?.stepsToReproduce ?? [];
  }

  @action
  updateRemediationSteps(steps: SecurityValidatedFindingStep[]) {
    this.remediationSteps = steps;

    this.selectedFinding?.set(
      'remediation',
      buildRemediation(this.selectedFinding.remediation, steps)
    );
  }

  @action
  updateReproductionSteps(steps: SecurityValidatedFindingStep[]) {
    this.stepsToReproduce = steps;
    this.selectedFinding?.set('poc', buildPoc(this.selectedFinding.poc, steps));
  }

  @action
  goToPreviousFinding() {
    this.selectFinding(
      this.findings[this.selectedIndex - 1] ?? this.selectedFinding
    );
  }

  @action
  goToNextFinding() {
    this.selectFinding(
      this.findings[this.selectedIndex + 1] ?? this.selectedFinding
    );
  }

  @action
  selectFindingPosition(option: SecurityValidatedFindingPositionOption) {
    this.selectFinding(option?.finding ?? this.selectedFinding);
  }

  // The row is only sent once every required field is filled, so Add Finding
  // opens an editor on an unsaved record rather than POSTing an empty one.
  @action
  addFinding() {
    if (this.hasReachedFindingsLimit) {
      return;
    }

    const finding = this.store.createRecord('security/validated-finding');

    this.findings = [...this.findings, finding];

    this.selectFinding(finding);
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

      this.selectFinding(this.findings[0] ?? null);
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });

  saveFinding = task({ drop: true }, async () => {
    const finding = this.selectedFinding;

    if (!finding) {
      return;
    }

    if (this.missingFields.length > 0) {
      this.notify.error(this.missingFieldsMessage);

      return;
    }

    const isNew = finding.get('isNew');

    try {
      await finding.save({ adapterOptions: this.findingRequestOptions });

      this.notify.success(
        this.intl.t(
          isNew
            ? 'securityAnalysisDetails.validatedFindings.findingAdded'
            : 'securityAnalysisDetails.validatedFindings.findingSaved'
        )
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
          // An unsaved finding was never sent, so there is nothing to delete.
          if (finding.get('isNew')) {
            finding.unloadRecord();

            continue;
          }

          await finding.destroyRecord({
            adapterOptions: this.findingRequestOptions,
          });
        }

        this.findings = this.findings.filter(
          (finding) => !findings.includes(finding)
        );

        this.selectFinding(this.findings[0] ?? null);
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
