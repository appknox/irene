import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import type { SecurityAnalysisFindingStep } from 'irene/models/security/analysis-finding';

export interface SecurityAnalysisDetailsValidatedFindingsStepListSignature {
  Args: {
    steps: SecurityAnalysisFindingStep[];
    addLabel: string;
    bodyPlaceholder: string;
    disabled?: boolean;
    onChange: (steps: SecurityAnalysisFindingStep[]) => void;
  };
}

export default class SecurityAnalysisDetailsValidatedFindingsStepListComponent extends Component<SecurityAnalysisDetailsValidatedFindingsStepListSignature> {
  @tracked draggedIndex: number | null = null;
  @tracked dropTargetIndex: number | null = null;

  get steps() {
    return this.args.steps ?? [];
  }

  isDropTarget = (index: number) => this.dropTargetIndex === index;

  // step_number is positional, so it is rewritten from the array order on
  // every change rather than tracked per step.
  commit(steps: SecurityAnalysisFindingStep[]) {
    this.args.onChange(
      steps.map((step, index) => ({ ...step, step_number: index + 1 }))
    );
  }

  replaceStep(index: number, changes: Partial<SecurityAnalysisFindingStep>) {
    const steps = this.steps.map((step, stepIndex) =>
      stepIndex === index ? { ...step, ...changes } : step
    );

    this.commit(steps);
  }

  @action
  addStep() {
    this.commit([
      ...this.steps,
      { step_number: this.steps.length + 1, heading: '', body: '' },
    ]);
  }

  @action
  removeStep(index: number) {
    this.commit(this.steps.filter((_, stepIndex) => stepIndex !== index));
  }

  @action
  updateHeading(index: number, event: Event) {
    this.replaceStep(index, {
      heading: (event.target as HTMLInputElement).value,
    });
  }

  @action
  updateBody(index: number, body: string) {
    this.replaceStep(index, { body });
  }

  @action
  handleDragStart(index: number) {
    this.draggedIndex = index;
  }

  @action
  handleDragOver(index: number, event: DragEvent) {
    event.preventDefault();

    this.dropTargetIndex = index;
  }

  @action
  handleDragLeave(index: number) {
    if (this.dropTargetIndex === index) {
      this.dropTargetIndex = null;
    }
  }

  @action
  handleDragEnd() {
    this.draggedIndex = null;
    this.dropTargetIndex = null;
  }

  @action
  handleDrop(targetIndex: number, event: DragEvent) {
    event.preventDefault();

    const sourceIndex = this.draggedIndex;

    this.dropTargetIndex = null;
    this.draggedIndex = null;

    if (sourceIndex === null || sourceIndex === targetIndex) {
      return;
    }

    const steps = [...this.steps];
    const [moved] = steps.splice(sourceIndex, 1);

    if (moved) {
      steps.splice(targetIndex, 0, moved);
      this.commit(steps);
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::ValidatedFindings::StepList': typeof SecurityAnalysisDetailsValidatedFindingsStepListComponent;
  }
}
