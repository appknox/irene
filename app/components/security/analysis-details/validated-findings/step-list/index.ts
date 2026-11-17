import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import {
  buildStepId,
  type SecurityValidatedFindingStep,
} from 'irene/utils/knoxiq-validated-findings';

import styles from './index.scss';

export interface SecurityAnalysisDetailsValidatedFindingsStepListSignature {
  Args: {
    steps: SecurityValidatedFindingStep[];
    addLabel: string;
    bodyPlaceholder: string;
    // Which step property the code field writes, or absent for no code
    // field. Remediation steps store a code example, reproduction steps a
    // command, and the API keeps them in different places.
    codeField?: 'codeExample' | 'command';
    codeFieldLabel?: string;
    codeFieldPlaceholder?: string;
    disabled?: boolean;
    onStepsChange: (steps: SecurityValidatedFindingStep[]) => void;
  };
}

export default class SecurityAnalysisDetailsValidatedFindingsStepListComponent extends Component<SecurityAnalysisDetailsValidatedFindingsStepListSignature> {
  readonly classes = { stepCard: styles['step-card'] };

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
  codeFieldValue(step: SecurityValidatedFindingStep) {
    return this.args.codeField === 'command'
      ? (step.command ?? '')
      : (step.codeExample ?? '');
  }

  @action
  handleCodeInput(index: number, event: Event) {
    const value = (event.target as HTMLTextAreaElement).value;

    this.replaceStep(
      index,
      this.args.codeField === 'command'
        ? { command: value }
        : { codeExample: value }
    );
  }

  // Only the handle is draggable, so selecting text in a field inside the
  // row no longer drags the whole step. The drag image is still the whole
  // card, so it reads as moving the step rather than the icon.
  @action
  handleDragStart(index: number, event: DragEvent) {
    this.draggedIndex = index;

    const handle = event.currentTarget as HTMLElement;
    const card = handle.closest<HTMLElement>(`.${this.classes.stepCard}`);

    if (card && event.dataTransfer) {
      const { left, top } = card.getBoundingClientRect();

      event.dataTransfer.setDragImage(
        card,
        event.clientX - left,
        event.clientY - top
      );
    }
  }

  @action
  isDragged(index: number) {
    return this.draggedIndex === index;
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
