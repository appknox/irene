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
  updateIntervals?: number[]; // undefined = natural counting
  onUpdate?: (state: RateLimitState) => void;
  onComplete?: (state: RateLimitState) => void;
  onClear?: (state: RateLimitState) => void;
}

export interface RateLimitHandleOptions {
  headers: object;
  requestData?: object;
  config?: RateLimitConfig;
}

export default class RateLimitManager {
  /**
   * Create initial rate limit state
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
   * Check if endpoint should bypass rate limiting
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
   * Generate natural counting intervals (59, 58, 57... 0)
   */
  private static generateNaturalIntervals(initialTime: number): number[] {
    const intervals: number[] = [];
    for (let i = initialTime - 1; i >= 0; i--) {
      intervals.push(i);
    }
    return intervals;
  }

  /**
   * Start countdown - returns updated state
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
    this.scheduleCountdownUpdate(context, newState, initialTime, config);

    return newState;
  }

  /**
   * Schedule next countdown update
   */
  private static scheduleCountdownUpdate(
    context: object,
    currentState: RateLimitState,
    initialTime: number,
    config: RateLimitConfig = {}
  ): void {
    // Determine intervals to use
    const intervals =
      config.updateIntervals ?? this.generateNaturalIntervals(initialTime);

    // Find next interval
    const nextInterval = intervals.find(
      (interval) => interval < currentState.remainingTime
    );

    if (nextInterval !== undefined) {
      // Calculate delay until next interval
      const delay = (currentState.remainingTime - nextInterval) * 1000;

      currentState.countdownTimerId = runTask(
        context,
        () => {
          // Update state
          currentState.remainingTime = nextInterval;

          // Notify update
          if (config.onUpdate) {
            config.onUpdate(currentState);
          }

          // Schedule next update
          this.scheduleCountdownUpdate(
            context,
            currentState,
            initialTime,
            config
          );
        },
        delay
      );
    } else {
      // Schedule final completion
      const delay = currentState.remainingTime * 1000;

      currentState.countdownTimerId = runTask(
        context,
        () => {
          // Clear countdown
          const clearedState = this.clearCountdown(
            context,
            currentState,
            config
          );

          // Notify completion
          if (config.onComplete) {
            config.onComplete(clearedState);
          }
        },
        delay
      );
    }
  }

  /**
   * Clear countdown - returns updated state
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
   * Handle rate limit response - returns updated state or null if not handled
   */
  static handleResponse(
    context: object,
    currentState: RateLimitState,
    options: RateLimitHandleOptions
  ): RateLimitState | null {
    const { headers, requestData = {}, config = {} } = options;

    // Check bypass
    if (this.shouldBypass(requestData, config.bypassEndpoints)) {
      return null;
    }

    // If already active, don't start new countdown
    if (currentState.isActive) {
      return null;
    }

    // Get retry-after from headers
    const retryAfter = (headers as Record<string, string>)?.['retry-after'];
    const retryTime = retryAfter ? parseInt(retryAfter) : 60;

    // Check if enough time has passed since last notification
    const now = Date.now();
    const timeSinceLastNotification = now - currentState.lastNotification;
    const notificationThreshold = retryTime * 1000;

    if (timeSinceLastNotification > notificationThreshold) {
      // Start countdown
      const newState = this.startCountdown(
        context,
        currentState,
        retryTime,
        config
      );

      // Update last notification time
      newState.lastNotification = now;

      return newState;
    }

    return null;
  }

  /**
   * Format time for display
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
   * Calculate progress percentage
   */
  static getProgress(state: RateLimitState): number {
    if (!state.isActive || state.retryAfter === 0) {
      return 0;
    }

    return ((state.retryAfter - state.remainingTime) / state.retryAfter) * 100;
  }
}
