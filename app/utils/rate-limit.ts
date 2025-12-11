import { Timer } from '@ember/runloop';
import { EmberRunTimer } from '@ember/runloop/types';
import { runTask, cancelTask } from 'ember-lifeline';

export interface RateLimitState {
  retryAfter: number;
  lastNotification: number;
  countdownTimerId: EmberRunTimer | Timer | null;
  remainingTime: number;
  isActive: boolean;
}

export interface RateLimitConfig {
  bypassEndpoints?: string[];
  updateIntervals?: number[];
  onUpdate?: (state: RateLimitState) => void;
  onComplete?: (state: RateLimitState) => void;
  onClear?: (state: RateLimitState) => void;
}

export interface RateLimitHandleOptions {
  requestData?: object;
  response: object;
  config?: RateLimitConfig;
}

export default class RateLimitManager {
  /**
   * Creates and returns an initial rate limit state object
   *
   * @returns {RateLimitState} A new rate limit state with default values
   */
  static createState(): RateLimitState {
    return {
      retryAfter: 0,
      lastNotification: 0,
      countdownTimerId: null,
      remainingTime: 0,
      isActive: false,
    };
  }

  /**
   * Checks if a given endpoint should bypass rate limiting
   *
   * @param {object} requestData - The request data object containing the URL
   * @param {string[]} bypassEndpoints - Array of endpoint patterns to bypass
   * @returns {boolean} True if the endpoint should bypass rate limiting, false otherwise
   */
  static shouldBypass(
    requestData: object,
    bypassEndpoints: string[] = []
  ): boolean {
    const url = (requestData as { url?: string })?.url;

    if (!url) {
      return false;
    }

    return bypassEndpoints.some((endpoint) => url.includes(endpoint));
  }

  /**
   * Starts a countdown timer and returns the updated state
   *
   * @param {object} context - The context object for scheduling tasks (usually the adapter)
   * @param {RateLimitState} currentState - The current rate limit state
   * @param {number} initialTime - The initial countdown time in seconds
   * @param {RateLimitConfig} config - Configuration options for callbacks and intervals
   * @returns {RateLimitState} The updated rate limit state with active countdown
   */
  static startCountdown(
    context: object,
    currentState: RateLimitState,
    initialTime: number,
    config: RateLimitConfig = {}
  ): RateLimitState {
    // If already active, return current state
    if (currentState.isActive) {
      return currentState;
    }

    // Clear any existing countdown
    const clearedState = this.clearCountdown(context, currentState, config);

    // Create new state
    const newState: RateLimitState = {
      ...clearedState,
      isActive: true,
      remainingTime: initialTime,
      retryAfter: initialTime,
    };

    // Notify initial state
    if (config.onUpdate) {
      config.onUpdate(newState);
    }

    // Schedule countdown updates
    this.scheduleCountdownUpdate(context, newState, config);

    return newState;
  }

  /**
   * Schedules the next countdown update based on config or defaults to 1-second decrements
   *
   * @param {object} context - The context object for scheduling tasks (usually the adapter)
   * @param {RateLimitState} currentState - The current rate limit state
   * @param {RateLimitConfig} config - Configuration options for callbacks and intervals
   */
  private static scheduleCountdownUpdate(
    context: object,
    currentState: RateLimitState,
    config: RateLimitConfig = {}
  ): void {
    // Determine next remaining time and delay
    let nextTime: number;
    let delay: number;

    if (config.updateIntervals && config.updateIntervals.length > 0) {
      // Find next interval from custom intervals
      const nextInterval = config.updateIntervals.find(
        (interval) => interval < currentState.remainingTime
      );

      nextTime = nextInterval ?? 0;
      delay = (currentState.remainingTime - nextTime) * 1000;
    } else {
      // Default: decrement by 1 second
      nextTime = currentState.remainingTime - 1;
      delay = 1000;
    }

    // Schedule next update
    currentState.countdownTimerId = runTask(
      context,
      () => {
        currentState.remainingTime = nextTime;

        // Check if countdown is complete
        if (currentState.remainingTime <= 0) {
          const clearedState = this.clearCountdown(
            context,
            currentState,
            config
          );

          config.onComplete?.(clearedState);
        } else {
          config.onUpdate?.(currentState);
          this.scheduleCountdownUpdate(context, currentState, config);
        }
      },
      delay
    );
  }

  /**
   * Clears any active countdown timer and returns the updated state
   *
   * @param {object} context - The context object for canceling tasks (usually the adapter)
   * @param {RateLimitState} currentState - The current rate limit state
   * @param {RateLimitConfig} config - Configuration options for callbacks
   * @returns {RateLimitState} The updated rate limit state with cleared countdown
   */
  static clearCountdown(
    context: object,
    currentState: RateLimitState,
    config: RateLimitConfig = {}
  ): RateLimitState {
    // Cancel timer if exists
    if (currentState.countdownTimerId !== null) {
      cancelTask(context, currentState.countdownTimerId as EmberRunTimer);
    }

    // Create cleared state
    const newState: RateLimitState = {
      ...currentState,
      countdownTimerId: null,
      remainingTime: 0,
      isActive: false,
    };

    // Notify clear
    if (config.onClear) {
      config.onClear(newState);
    }

    return newState;
  }

  /**
   * Handles a rate limit response and initiates countdown if necessary
   *
   * @param {object} context - The context object for scheduling tasks (usually the adapter)
   * @param {RateLimitState} currentState - The current rate limit state
   * @param {RateLimitHandleOptions} options - Options containing response headers, request data, and config
   * @returns {RateLimitState | null} The updated rate limit state if handled, null if bypassed or already active
   */
  static handleResponse(
    context: object,
    currentState: RateLimitState,
    options: RateLimitHandleOptions
  ): RateLimitState | null {
    const { response, requestData = {}, config = {} } = options;

    // Check bypass or countdown active state
    if (
      this.shouldBypass(requestData, config.bypassEndpoints) ||
      currentState.isActive
    ) {
      return null;
    }

    const resp = response as { detail: { lock_time?: number } };
    const lockTime = resp.detail?.lock_time;

    const retryTime =
      typeof lockTime === 'number' && lockTime > 0 ? Math.ceil(lockTime) : 60; // fallback default

    // Check if enough time has passed since last notification
    const now = Date.now();
    const timeSinceLastNotification = now - currentState.lastNotification;
    const notificationThreshold = retryTime * 1000;

    if (timeSinceLastNotification > notificationThreshold) {
      const newState = this.startCountdown(
        context,
        currentState,
        retryTime,
        config
      );

      newState.lastNotification = now;
      return newState;
    }

    return null;
  }

  /**
   * Formats time in seconds to a human-readable string
   *
   * @param {number} seconds - The time in seconds to format
   * @returns {string} Formatted time string (e.g., "2m 30s" or "45s")
   */
  static formatTime(seconds: number): string {
    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;

      return `${minutes}m ${remainingSeconds}s`;
    }

    return `${seconds}s`;
  }

  /**
   * Calculates the progress percentage of the countdown
   *
   * @param {RateLimitState} state - The current rate limit state
   * @returns {number} Progress percentage (0-100)
   */
  static getProgress(state: RateLimitState): number {
    if (!state.isActive || state.retryAfter === 0) {
      return 0;
    }

    return ((state.retryAfter - state.remainingTime) / state.retryAfter) * 100;
  }
}
