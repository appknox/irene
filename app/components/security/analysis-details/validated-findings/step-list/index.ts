import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import {
  buildStepId,
  type SecurityValidatedFindingStep,
} from 'irene/utils/knoxiq-validated-findings';

export interface SecurityAnalysisDetailsValidatedFindingsStepListSignature {
  Args: {
    steps: SecurityValidatedFindingStep[];
    addLabel: string;
    bodyPlaceholder: string;
    disabled?: boolean;
    onStepsChange: (steps: SecurityValidatedFindingStep[]) => void;
  };
}

export default class SecurityAnalysisDetailsValidatedFindingsStepListComponent extends Component<SecurityAnalysisDetailsValidatedFindingsStepListSignature> {
  @tracked draggedIndex: number | null = null;
  @tracked dropTargetIndex: number | null = null;

  get steps() {
    return this.args.steps ?? [];
  }

  isDropTarget = (index: number) => this.dropTargetIndex === index;

  commitSteps(steps: SecurityValidatedFindingStep[]) {
    this.args.onStepsChange(steps);
  }

  replaceStep(index: number, changes: Partial<SecurityValidatedFindingStep>) {
    const updatedSteps = this.steps.map((step, stepIndex) =>
      stepIndex === index ? { ...step, ...changes } : step
    );

    this.commitSteps(updatedSteps);
  }

  @action
  handleAddStep() {
    this.commitSteps([
      ...this.steps,
      { heading: '', body: '', id: buildStepId() },
    ]);
  }

  @action
  handleRemoveStep(index: number) {
    this.commitSteps(this.steps.filter((_, stepIndex) => stepIndex !== index));
  }

  @action
  handleHeadingInput(index: number, event: Event) {
    this.replaceStep(index, {
      heading: (event.target as HTMLInputElement).value,
    });
  }

  @action
  handleBodyChange(index: number, body: string) {
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

    const reorderedSteps = [...this.steps];
    const [movedStep] = reorderedSteps.splice(sourceIndex, 1);

    if (movedStep) {
      reorderedSteps.splice(targetIndex, 0, movedStep);
      this.commitSteps(reorderedSteps);
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::ValidatedFindings::StepList': typeof SecurityAnalysisDetailsValidatedFindingsStepListComponent;
  }
}
