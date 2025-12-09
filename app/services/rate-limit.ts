import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import type IntlService from 'ember-intl/services/intl';

import RLM, { type RateLimitState } from 'irene/utils/rate-limit';
import type AnalyticsService from './analytics';

export default class RateLimitService extends Service {
  @service('notifications') declare notify: NotificationService;
  @service('browser/window') declare window: Window;
  @service declare intl: IntlService;
  @service declare analytics: AnalyticsService;

  @tracked state: RateLimitState = RLM.createState();

  // Configuration
  bypassEndpoints = ['/upload_app'];
  private updateIntervals = [120, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 5];

  /**
   * Computed properties for easy component access
   */
  get isActive() {
    return this.state.isActive;
  }

  get remainingTime() {
    return this.state.remainingTime;
  }

  get formattedTime() {
    return RLM.formatTime(this.state.remainingTime);
  }

  get progress() {
    return RLM.getProgress(this.state);
  }

  /**
   * Handles a 429 rate limit response from the server
   *
   * @param adapter - The adapter context for scheduling tasks
   * @param response - Response object containing rate limit headers
   * @param requestData - Request data for bypass checking
   * @returns The new state if rate limit was triggered, null otherwise
   */
  handleResponse(
    adapter: object,
    response: object,
    requestData: object = {}
  ): RateLimitState | null {
    const newState = RLM.handleResponse(adapter, this.state, {
      response,
      requestData,
      config: {
        bypassEndpoints: this.bypassEndpoints,
        updateIntervals: this.updateIntervals,
        onUpdate: this.onRateLimitTimerUpdate,
        onComplete: this.onRateLimitTimerComplete,
      },
    });

    // Update tracked state if rate limit was triggered
    if (newState) {
      this.state = newState;

      this.analytics.track({
        name: 'RATE_LIMIT_ERROR_EVENT',
        properties: {
          response,
          requestData,
        },
      });
    }

    return newState;
  }

  /**
   * Called when countdown timer updates
   * Shows/updates notification with remaining time
   */
  @action
  onRateLimitTimerUpdate(state: RateLimitState) {
    this.state = state;

    const message = `${this.intl.t('rateLimitExceeded')} ${RLM.formatTime(state.remainingTime)}`;

    this.notify?.clearAll?.();
    this.notify?.error?.(message, { autoClear: false });
  }

  /**
   * Called when countdown completes
   * Clears notifications only - does NOT reload page
   */
  @action
  onRateLimitTimerComplete(state: RateLimitState) {
    this.state = state;
    this.notify.clearAll?.();

    // Show a message that rate limit has been lifted
    this.notify.info(this.intl.t('rateLimitLifted'), { autoClear: false });
  }

  /**
   * Manually clear the countdown
   * Useful for testing or manual override
   */
  @action
  clearCountdown(adapter: object) {
    this.state = RLM.clearCountdown(adapter, this.state);
    this.notify.clearAll?.();
  }

  /**
   * Cleanup when service is destroyed
   */
  willDestroy() {
    super.willDestroy();

    // Clear notifications
    this.notify.clearAll?.();

    // Clear countdown timer if active
    if (this.state.isActive) {
      this.state = RLM.clearCountdown(this, this.state);
    }
  }
}
