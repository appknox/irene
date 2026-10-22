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
  evidenceToHtml,
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
// What every finding must say, whatever it concludes.
export const SECURITY_VALIDATED_FINDING_REQUIRED_FIELDS = [
  'confidence',
  'summary',
  'reasoning',
] as const;

// Required too, except on an analysis whose findings are all false positives:
// there is nothing to remediate, reproduce or exploit, so demanding these
// would leave such a finding unsaveable.
export const SECURITY_VALIDATED_FINDING_TRUE_POSITIVE_REQUIRED_FIELDS = [
  'remediationSteps',
  'stepsToReproduce',
  'exploitabilityAnalysis',
] as const;

// The fields the API stores as a list of strings. Prose in one of them would
// be saved as a single entry, which is almost never what was meant.
export const SECURITY_VALIDATED_FINDING_LIST_FIELDS = [
  'evidence',
  'exploitabilityEvidence',
  'attackScenario',
  'expectedEvidence',
] as const;

export type SecurityValidatedFindingListField =
  (typeof SECURITY_VALIDATED_FINDING_LIST_FIELDS)[number];

export type SecurityValidatedFindingRequiredField =
  | (typeof SECURITY_VALIDATED_FINDING_REQUIRED_FIELDS)[number]
  | (typeof SECURITY_VALIDATED_FINDING_TRUE_POSITIVE_REQUIRED_FIELDS)[number];

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
    // Which class of finding this section shows. The two are separate
    // sections rather than one toggled list, so both are visible at once.
    showsFalsePositives?: boolean;
    readOnly?: boolean;
    onRegisterReload?: (reloadFindings: () => void) => void;
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

  @tracked showListFieldErrors = false;
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

    // The page refetches through this after an action it owns, such as
    // marking the analysis passed, which empties the list server-side.
    this.args.onRegisterReload?.(() => this.fetchFindings.perform());
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

  get showsFalsePositives() {
    return Boolean(this.args.showsFalsePositives);
  }

  get sectionTitleKey() {
    return this.showsFalsePositives
      ? 'securityAnalysisDetails.validatedFindings.falsePositivesTitle'
      : 'securityAnalysisDetails.validatedFindings.title';
  }

  get sectionDescriptionKey() {
    return this.showsFalsePositives
      ? 'securityAnalysisDetails.validatedFindings.falsePositivesDescription'
      : 'securityAnalysisDetails.validatedFindings.description';
  }

  get sectionTestId() {
    return this.showsFalsePositives ? 'falsePositives' : 'validatedFindings';
  }

  get addFindingDisabledReason() {
    if (this.isReadOnly) {
      return this.intl.t(
        'securityAnalysisDetails.validatedFindings.readOnlyReason'
      );
    }

    if (this.hasReachedFindingsLimit) {
      return this.intl.t(
        'securityAnalysisDetails.validatedFindings.limitReached',
        { limit: SECURITY_ANALYSIS_FINDINGS_LIMIT }
      );
    }

    return '';
  }

  get isAddFindingDisabled() {
    return this.isWritingFinding || Boolean(this.addFindingDisabledReason);
  }

  get areAllPanelsOpen() {
    return this.allPanelIds.every((panel) => this.openPanels.includes(panel));
  }

  get findingRequestOptions() {
    // The section decides the class, so a true positive can be recorded on
    // an analysis whose findings are otherwise all false positives.
    return {
      analysisId: String(this.analysis?.id),
      isValid: !this.showsFalsePositives,
    };
  }

  get isWritingFinding() {
    return this.saveFinding.isRunning || this.deleteFindings.isRunning;
  }

  get isReadOnly() {
    return Boolean(this.args.readOnly);
  }

  /**
   * The fields this finding has to fill in. An all-false-positive analysis
   * asks for less, because remediation and reproduction do not apply to it.
   */
  get requiredFields(): readonly SecurityValidatedFindingRequiredField[] {
    return this.analysis?.isKnoxiqAllFp
      ? SECURITY_VALIDATED_FINDING_REQUIRED_FIELDS
      : [
          ...SECURITY_VALIDATED_FINDING_REQUIRED_FIELDS,
          ...SECURITY_VALIDATED_FINDING_TRUE_POSITIVE_REQUIRED_FIELDS,
        ];
  }

  /** The required fields the selected finding has not filled in yet. */
  get missingRequiredFields(): SecurityValidatedFindingRequiredField[] {
    const content = this.selectedFinding?.content;

    if (!content) {
      return [];
    }

    const isFilled: Record<SecurityValidatedFindingRequiredField, boolean> = {
      confidence: content.confidence !== UNKNOWN_SCALE_VALUE,
      summary: this.hasVisibleText(content.summary),
      reasoning: this.hasVisibleText(content.reasoning),
      remediationSteps: this.hasFilledStep(content.remediationSteps),
      stepsToReproduce: this.hasFilledStep(content.stepsToReproduce),
      exploitabilityAnalysis: this.hasVisibleText(
        content.exploitabilityAnalysis
      ),
    };

    return this.requiredFields.filter((field) => !isFilled[field]);
  }

  // [^<>] keeps the match from running past an opening bracket, which is
  // what makes the tag strip backtrack.
  hasVisibleText(value: string) {
    return value.replace(/<[^<>]*>/g, '').trim().length > 0;
  }

  // An empty row is what the Add button inserts, so the list counts as
  // filled only once a row carries a heading or a body.
  hasFilledStep(steps: SecurityValidatedFindingStep[]) {
    return steps.some(
      (step) =>
        this.hasVisibleText(step.heading) || this.hasVisibleText(step.body)
    );
  }

  /**
   * The list fields holding prose instead of list items. Empty is fine; a
   * paragraph is not, because it would be stored as one entry.
   */
  get invalidListFields(): SecurityValidatedFindingListField[] {
    const finding = this.selectedFinding;

    if (!finding) {
      return [];
    }

    const html: Record<SecurityValidatedFindingListField, string> = {
      evidence: finding.evidenceHtml,
      exploitabilityEvidence: evidenceToHtml(finding.exploitabilityEvidence),
      attackScenario: evidenceToHtml(finding.attackScenario),
      expectedEvidence: evidenceToHtml(finding.expectedEvidence),
    };

    return SECURITY_VALIDATED_FINDING_LIST_FIELDS.filter(
      (field) =>
        this.hasVisibleText(html[field]) && !html[field].includes('<li')
    );
  }

  get isSelectedFindingComplete() {
    return this.missingRequiredFields.length === 0;
  }

  /** Why Save is unavailable, or '' when it is available. */
  // Only the fields that failed the last save attempt are marked, so a
  // field the reader has since fixed stops being red on the next try.
  get markedListFields(): SecurityValidatedFindingListField[] {
    return this.showListFieldErrors ? this.invalidListFields : [];
  }

  get saveDisabledReason() {
    if (this.isReadOnly) {
      return this.intl.t(
        'securityAnalysisDetails.validatedFindings.readOnlyReason'
      );
    }

    return this.isSelectedFindingComplete
      ? ''
      : this.missingRequiredFieldsMessage;
  }

  get isSaveDisabled() {
    return this.isWritingFinding || Boolean(this.saveDisabledReason);
  }

  get missingRequiredFieldsMessage() {
    const fields = this.missingRequiredFields
      .map((field) =>
        this.intl.t(`securityAnalysisDetails.validatedFindings.field.${field}`)
      )
      .join(', ');

    return this.intl.t(
      'securityAnalysisDetails.validatedFindings.missingFields',
      { fields }
    );
  }

  get emptyStateMessage() {
    return this.intl.t(
      this.showsFalsePositives
        ? 'securityAnalysisDetails.validatedFindings.noFalsePositives'
        : 'securityAnalysisDetails.validatedFindings.emptyState'
    );
  }

  // The delete entries need something to act on, so an analysis with no
  // findings only offers the view actions.
  get moreMenuItems(): SecurityValidatedFindingMenuItem[] {
    if (!this.hasFindings) {
      return [this.originalAnalysisMenuItem];
    }

    return [
      { ...this.originalAnalysisMenuItem, divider: true },
      {
        id: 'deleteFinding',
        labelKey: 'securityAnalysisDetails.validatedFindings.deleteThisFinding',
        iconName: 'delete-outline',
        iconColor: 'textPrimary',
        divider: true,
        disabled: this.isWritingFinding || this.isReadOnly,
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
        disabled: this.isWritingFinding || this.isReadOnly,
        title: '',
        onClick: this.openDeleteAllFindingsConfirm,
      },
    ];
  }

  get originalAnalysisMenuItem(): SecurityValidatedFindingMenuItem {
    return {
      id: 'originalAnalysis',
      labelKey: 'securityAnalysisDetails.validatedFindings.originalAnalysis',
      iconName: 'description-outline',
      iconColor: 'textPrimary',
      divider: false,
      disabled: false,
      title: '',
      onClick: this.openOriginalAnalysis,
    };
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
    if (this.isAddFindingDisabled) {
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
          // The endpoint returns true positives unless asked otherwise.
          ...(this.showsFalsePositives ? { is_valid: false } : {}),
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

    if (this.missingRequiredFields.length > 0) {
      this.notify.error(this.missingRequiredFieldsMessage);

      return;
    }

    // Marked on save rather than while typing, so a half-written list does
    // not turn red under the reader.
    if (this.invalidListFields.length > 0) {
      this.showListFieldErrors = true;

      this.notify.error(
        this.intl.t(
          'securityAnalysisDetails.validatedFindings.listFieldsNeedItems'
        )
      );

      return;
    }

    this.showListFieldErrors = false;

    const isNew = finding.get('isNew');

    try {
      await finding.save({ adapterOptions: this.findingRequestOptions });

      // The analysis AEIS card is computed from the highest-scoring finding,
      // so saving one can change it.
      await this.analysis?.reload();

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
