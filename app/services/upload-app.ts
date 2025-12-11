import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import Service from '@ember/service';
import type { Queue } from 'ember-file-upload/queue';

import RLM, { type RateLimitState } from 'irene/utils/rate-limit';

export default class UploadAppService extends Service {
  @tracked submissionSet = new Set<string>();
  @tracked anchorRef?: HTMLElement | null;
  @tracked dupAnchorRef?: HTMLElement | null;
  @tracked systemFileQueue: Queue | null = null;
  @tracked keepPopoverOpen = false;

  // Rate limit
  @tracked rateLimitState: RateLimitState = RLM.createState();
  @tracked showRateLimitError = false;

  get rateLimitRemainingTime(): number {
    return this.rateLimitState.remainingTime;
  }

  get rateLimitFormattedTime() {
    return RLM.formatTime(this.rateLimitState.remainingTime);
  }

  @action
  showAndStartRateLimitErrorCountdown(remainingTime: number) {
    this.showRateLimitError = true;

    const retryTime = Math.ceil(remainingTime);

    const newState = RLM.startCountdown(this, this.rateLimitState, retryTime, {
      onUpdate: (state) => (this.rateLimitState = state),
      onComplete: (state) => {
        this.rateLimitState = state;
        this.clearRateLimitError();
      },
    });

    this.rateLimitState = newState;
  }

  @action
  clearRateLimitError() {
    this.showRateLimitError = false;

    const clearedState = RLM.clearCountdown(this, this.rateLimitState);

    this.rateLimitState = clearedState;
  }

  @action
  updateSystemFileQueue(queue: Queue | null) {
    this.systemFileQueue = queue;
  }

  @action openSubsPopover(element?: HTMLElement | null) {
    this.anchorRef = element || this.dupAnchorRef;

    /*
     * This variable is required in the event both the "dupAnchorRef" and the element argument are both undefined.
     * This mostly happens when this function is executed in a component where the anchorRef element context is not available.
     * An example is the Upload App Via Link modal.
     * This function sets the "keepPopoverOpen" value to true and when status loader is injected into the DOM,
     * the "updateSubsPopoverAnchorRef" is triggered and sets the anchorRef to an element
     * thereby triggering the popover automatically (See - Line 41 of this file).
     */
    this.keepPopoverOpen = true;
  }

  @action closeSubsPopover() {
    this.anchorRef = null;
    this.keepPopoverOpen = false;
  }

  @action
  updateSubsPopoverAnchorRef(element: HTMLElement | null) {
    // Only register anchor ref whenever the submissions modal is meant to be opened
    // The popover is meant to be opened only when user initiates an upload or when user manually opens popover
    // If true, this will cause the popover to open automatically
    if (this.keepPopoverOpen) {
      this.anchorRef = element;
    }

    // Duplicate is required to open popover when the anchorRef context isn't available in calling component
    this.dupAnchorRef = element;
  }

  willDestroy(): void {
    super.willDestroy();
    this.clearRateLimitError();
  }
}
