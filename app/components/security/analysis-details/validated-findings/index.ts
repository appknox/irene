import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

import ENV from 'irene/config/environment';
import parseError from 'irene/utils/parse-error';
import type SecurityAnalysisModel from 'irene/models/security/analysis';
import type IreneAjaxService from 'irene/services/ajax';
import {
  fromKnoxiqFindingResponse,
  type KnoxiqFindingApiResponse,
} from 'irene/utils/knoxiq-finding-draft';

interface KnoxiqFindingsPage {
  results: KnoxiqFindingApiResponse[];
}

export interface ValidatedFindingStep {
  heading: string;
  body: string;
}

export interface ValidatedFinding {
  id: string;
  title: string;
  description: string;
  confidence: number;
  summary: string;
  evidence: string[];
  reasoning: string;
  remediation_steps: ValidatedFindingStep[];
  steps_to_reproduce: ValidatedFindingStep[];
  exploitability_likelihood: number;
  exploitability_analysis: string;
}

export interface SecurityAnalysisDetailsValidatedFindingsComponentSignature {
  Args: {
    analysis: SecurityAnalysisModel | null;
  };
}

export interface FindingPositionOption {
  position: number;
  label: string;
}

const CONFIDENCE_OPTIONS = [
  { value: 3, label: 'High' },
  { value: 2, label: 'Medium' },
  { value: 1, label: 'Low' },
  { value: -1, label: 'Unknown' },
];

const ACCORDION_PANEL = {
  REMEDIATION: 'remediation',
  STEPS_TO_REPRODUCE: 'steps-to-reproduce',
  EXPLOITABILITY: 'exploitability',
} as const;

const ALL_PANEL_IDS = Object.values(ACCORDION_PANEL);

export default class SecurityAnalysisDetailsValidatedFindingsComponent extends Component<SecurityAnalysisDetailsValidatedFindingsComponentSignature> {
  @service declare notifications: NotificationService;
  @service declare ajax: IreneAjaxService;

  @tracked findings: ValidatedFinding[] = [];
  @tracked currentIndex = 0;
  @tracked draft: ValidatedFinding | null = null;
  @tracked openPanels: string[] = [];
  @tracked loadError: string | null = null;

  confidenceOptions = CONFIDENCE_OPTIONS;
  exploitabilityOptions = CONFIDENCE_OPTIONS;
  accordionPanel = ACCORDION_PANEL;

  constructor(
    owner: unknown,
    args: SecurityAnalysisDetailsValidatedFindingsComponentSignature['Args']
  ) {
    super(owner, args);
    this.loadFindings.perform();
  }

  get analysis() {
    return this.args.analysis;
  }

  get isLoading() {
    return this.loadFindings.isRunning;
  }

  get totalCount() {
    return this.findings.length;
  }

  get formattedPosition() {
    return String(this.currentIndex + 1).padStart(2, '0');
  }

  get formattedTotal() {
    return String(this.totalCount).padStart(2, '0');
  }

  get isFirst() {
    return this.currentIndex <= 0;
  }

  get isLast() {
    return this.currentIndex >= this.totalCount - 1;
  }

  get selectedConfidenceOption() {
    return (
      this.confidenceOptions.find((o) => o.value === this.draft?.confidence) ??
      null
    );
  }

  get selectedExploitabilityOption() {
    return (
      this.exploitabilityOptions.find(
        (o) => o.value === this.draft?.exploitability_likelihood
      ) ?? null
    );
  }

  get areAllPanelsOpen() {
    return ALL_PANEL_IDS.every((id) => this.openPanels.includes(id));
  }

  get positionOptions(): FindingPositionOption[] {
    return this.findings.map((_, index) => ({
      position: index + 1,
      label: String(index + 1).padStart(2, '0'),
    }));
  }

  get selectedPositionOption(): FindingPositionOption | null {
    return this.positionOptions[this.currentIndex] ?? null;
  }

  findingsUrl(suffix = '') {
    return `knoxiq/analyses/${this.analysis?.id}/findings${suffix}`;
  }

  private loadDraft() {
    const finding = this.findings[this.currentIndex];
    this.draft = finding ? { ...finding } : null;
  }

  @action goToPrevious() {
    if (this.isFirst) {
      return;
    }
    this.currentIndex -= 1;
    this.loadDraft();
  }

  @action goToNext() {
    if (this.isLast) {
      return;
    }
    this.currentIndex += 1;
    this.loadDraft();
  }

  @action setConfidence(option: { value: number; label: string }) {
    if (!this.draft) {
      return;
    }
    this.draft = { ...this.draft, confidence: option.value };
  }

  @action setExploitabilityLikelihood(option: {
    value: number;
    label: string;
  }) {
    if (!this.draft) {
      return;
    }
    this.draft = { ...this.draft, exploitability_likelihood: option.value };
  }

  @action setField(field: 'title' | 'summary', event: Event) {
    if (!this.draft) {
      return;
    }
    const value = (event.target as HTMLTextAreaElement).value;
    this.draft = { ...this.draft, [field]: value };
  }

  @action setFieldValue(
    field: 'reasoning' | 'exploitability_analysis',
    value: string
  ) {
    if (!this.draft) {
      return;
    }
    this.draft = { ...this.draft, [field]: value };
  }

  @action onPositionSelect(option: FindingPositionOption) {
    if (!option) {
      return;
    }
    this.currentIndex = option.position - 1;
    this.loadDraft();
  }

  @action isPanelOpen(panelId: string) {
    return this.openPanels.includes(panelId);
  }

  @action togglePanel(panelId: string) {
    this.openPanels = this.openPanels.includes(panelId)
      ? this.openPanels.filter((id) => id !== panelId)
      : [...this.openPanels, panelId];
  }

  @action toggleExpandAll() {
    this.openPanels = this.areAllPanelsOpen ? [] : [...ALL_PANEL_IDS];
  }

  @action setEvidenceLine(index: number, event: Event) {
    if (!this.draft) {
      return;
    }
    const value = (event.target as HTMLInputElement).value;
    const evidence = [...this.draft.evidence];
    evidence[index] = value;
    this.draft = { ...this.draft, evidence };
  }

  @action addEvidenceLine() {
    if (!this.draft) {
      return;
    }
    this.draft = { ...this.draft, evidence: [...this.draft.evidence, ''] };
  }

  @action removeEvidenceLine(index: number) {
    if (!this.draft) {
      return;
    }
    this.draft = {
      ...this.draft,
      evidence: this.draft.evidence.filter((_, i) => i !== index),
    };
  }

  @action setStep(
    listName: 'remediation_steps' | 'steps_to_reproduce',
    index: number,
    field: 'heading',
    event: Event
  ) {
    if (!this.draft) {
      return;
    }
    const value = (event.target as HTMLInputElement).value;
    this.setStepValue(listName, index, field, value);
  }

  @action setStepValue(
    listName: 'remediation_steps' | 'steps_to_reproduce',
    index: number,
    field: 'heading' | 'body',
    value: string
  ) {
    if (!this.draft) {
      return;
    }
    const list = [...this.draft[listName]];
    list[index] = { ...list[index], [field]: value } as ValidatedFindingStep;
    this.draft = { ...this.draft, [listName]: list };
  }

  @action addStep(listName: 'remediation_steps' | 'steps_to_reproduce') {
    if (!this.draft) {
      return;
    }
    this.draft = {
      ...this.draft,
      [listName]: [...this.draft[listName], { heading: '', body: '' }],
    };
  }

  @action removeStep(
    listName: 'remediation_steps' | 'steps_to_reproduce',
    index: number
  ) {
    if (!this.draft) {
      return;
    }
    this.draft = {
      ...this.draft,
      [listName]: this.draft[listName].filter((_, i) => i !== index),
    };
  }

  @action triggerSave() {
    this.saveFinding.perform();
  }

  @action triggerRetry() {
    this.loadFindings.perform();
  }

  @action triggerAddFinding() {
    this.addFinding.perform();
  }

  @action triggerDeleteFinding() {
    // eslint-disable-next-line no-alert
    if (window.confirm('Delete this finding? This cannot be undone.')) {
      this.deleteFinding.perform();
    }
  }

  loadFindings = task(async () => {
    this.loadError = null;
    try {
      const page = await this.ajax.request<KnoxiqFindingsPage>(
        this.findingsUrl(),
        { namespace: ENV.namespace }
      );
      this.findings = page.results.map(fromKnoxiqFindingResponse);
      this.currentIndex = 0;
      this.loadDraft();
    } catch (error) {
      // Distinct from "zero findings" - the empty state must not claim
      // there's nothing here when the real reason is a failed fetch.
      this.loadError = parseError(error, 'Please try again');
      this.notifications.error(this.loadError);
    }
  });

  saveFinding = task(async () => {
    if (!this.draft) {
      return;
    }

    try {
      const response = await this.ajax.makeRequest<KnoxiqFindingApiResponse>(
        this.findingsUrl(`/${this.draft.id}`),
        {
          method: 'PATCH',
          namespace: ENV.namespace,
          data: JSON.stringify(this.draft),
        }
      );

      const updated = fromKnoxiqFindingResponse(response);
      this.findings = this.findings.map((f, i) =>
        i === this.currentIndex ? updated : f
      );
      this.draft = { ...updated };
      this.notifications.success('Finding updated');
    } catch (error) {
      this.notifications.error(parseError(error, 'Please try again'));
    }
  });

  addFinding = task(async () => {
    try {
      const response = await this.ajax.post<KnoxiqFindingApiResponse>(
        this.findingsUrl(),
        { namespace: ENV.namespace, data: JSON.stringify({}) }
      );

      const created = fromKnoxiqFindingResponse(response);
      this.findings = [...this.findings, created];
      this.currentIndex = this.findings.length - 1;
      this.loadDraft();
      this.notifications.success('Finding added');
    } catch (error) {
      this.notifications.error(parseError(error, 'Please try again'));
    }
  });

  deleteFinding = task(async () => {
    if (!this.draft) {
      return;
    }

    try {
      await this.ajax.delete(this.findingsUrl(`/${this.draft.id}`), {
        namespace: ENV.namespace,
      });

      const deletedIndex = this.currentIndex;
      this.findings = this.findings.filter((_, i) => i !== deletedIndex);
      this.currentIndex = Math.max(
        0,
        Math.min(deletedIndex, this.findings.length - 1)
      );
      this.loadDraft();
      this.notifications.success('Finding deleted');
    } catch (error) {
      this.notifications.error(parseError(error, 'Please try again'));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::ValidatedFindings': typeof SecurityAnalysisDetailsValidatedFindingsComponent;
  }
}
