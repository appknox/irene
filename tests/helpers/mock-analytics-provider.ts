/**
 * Mock Analytics Provider for Testing
 *
 * This provider can be used in unit and integration tests to:
 * - Avoid making real analytics API calls
 * - Assert that events are tracked correctly
 * - Verify user identification
 * - Test analytics behavior without external dependencies
 *
 * Usage in tests:
 * ```typescript
 * import { setupMockAnalytics } from 'irene/tests/helpers/mock-analytics-provider';
 *
 * test('tracks event when button clicked', async function(assert) {
 *   const mockProvider = setupMockAnalytics(this.owner);
 *
 *   await render(hbs`<MyComponent />`);
 *   await click('[data-test-button]');
 *
 *   assert.true(mockProvider.hasTrackedEvent('button_clicked'));
 *   assert.strictEqual(mockProvider.getEventCount('button_clicked'), 1);
 * });
 * ```
 */

import type {
  AnalyticsProvider,
  ProviderConfig,
  UserTraits,
  EventProperties,
  PageProperties,
} from '../../app/providers/analytics-provider';

interface TrackedEvent {
  event: string;
  properties?: EventProperties;
  timestamp: Date;
}

interface IdentifiedUser {
  userId: string;
  traits?: UserTraits;
  timestamp: Date;
}

interface TrackedPage {
  pageName?: string;
  properties?: PageProperties;
  timestamp: Date;
}

/**
 * Mock Analytics Provider
 * Implements AnalyticsProvider interface for testing purposes
 */
export class MockAnalyticsProvider implements AnalyticsProvider {
  name = 'mock' as const;
  private _isReady = false;

  // Storage for tracked data
  trackedEvents: TrackedEvent[] = [];
  identifiedUsers: IdentifiedUser[] = [];
  trackedPages: TrackedPage[] = [];
  resetCount = 0;

  /**
   * Initialize the mock provider (instant, no async needed)
   */
  async initialize(config: ProviderConfig): Promise<void> {
    if (config.enabled) {
      this._isReady = true;
    }
  }

  /**
   * Check if provider is ready
   */
  isReady(): boolean {
    return this._isReady;
  }

  /**
   * Identify a user (stores for assertions)
   */
  identify(userId: string, traits?: UserTraits): void {
    if (!this.isReady()) {
      return;
    }

    this.identifiedUsers.push({
      userId,
      traits,
      timestamp: new Date(),
    });
  }

  /**
   * Track an event (stores for assertions)
   */
  track(event: string, properties?: EventProperties): void {
    if (!this.isReady()) {
      return;
    }

    this.trackedEvents.push({
      event,
      properties,
      timestamp: new Date(),
    });
  }

  /**
   * Track a page view (stores for assertions)
   */
  page(pageName?: string, properties?: PageProperties): void {
    if (!this.isReady()) {
      return;
    }

    this.trackedPages.push({
      pageName,
      properties,
      timestamp: new Date(),
    });
  }

  /**
   * Reset the provider (clears user identity)
   */
  reset(): void {
    this.resetCount++;
  }

  /**
   * Reset all tracked data (for test cleanup)
   */
  resetTracking(): void {
    this.trackedEvents = [];
    this.identifiedUsers = [];
    this.trackedPages = [];
    this.resetCount = 0;
  }

  // === Assertion Helpers ===

  /**
   * Check if a specific event was tracked
   */
  hasTrackedEvent(eventName: string): boolean {
    return this.trackedEvents.some((e) => e.event === eventName);
  }

  /**
   * Get the number of times an event was tracked
   */
  getEventCount(eventName: string): number {
    return this.trackedEvents.filter((e) => e.event === eventName).length;
  }

  /**
   * Get all instances of a tracked event
   */
  getTrackedEvents(eventName: string): TrackedEvent[] {
    return this.trackedEvents.filter((e) => e.event === eventName);
  }

  /**
   * Get properties of the first occurrence of an event
   */
  getEventProperties(eventName: string): EventProperties | undefined {
    return this.trackedEvents.find((e) => e.event === eventName)?.properties;
  }

  /**
   * Get properties of the most recent occurrence of an event
   */
  getLastEventProperties(eventName: string): EventProperties | undefined {
    const events = this.getTrackedEvents(eventName);
    return events.length > 0
      ? events[events.length - 1]?.properties
      : undefined;
  }

  /**
   * Check if a user was identified
   */
  hasIdentifiedUser(userId: string): boolean {
    return this.identifiedUsers.some((u) => u.userId === userId);
  }

  /**
   * Get traits of an identified user
   */
  getUserTraits(userId: string): UserTraits | undefined {
    return this.identifiedUsers.find((u) => u.userId === userId)?.traits;
  }

  /**
   * Get the most recent user identification
   */
  getLastIdentifiedUser(): IdentifiedUser | undefined {
    return this.identifiedUsers.length > 0
      ? this.identifiedUsers[this.identifiedUsers.length - 1]
      : undefined;
  }

  /**
   * Check if a page was tracked
   */
  hasTrackedPage(pageName: string): boolean {
    return this.trackedPages.some((p) => p.pageName === pageName);
  }

  /**
   * Get the number of page views tracked
   */
  getPageViewCount(): number {
    return this.trackedPages.length;
  }

  /**
   * Get all tracked pages
   */
  getAllTrackedPages(): TrackedPage[] {
    return [...this.trackedPages];
  }

  /**
   * Assert that specific events were tracked in order
   */
  assertEventsTrackedInOrder(eventNames: string[]): boolean {
    const trackedEventNames = this.trackedEvents.map((e) => e.event);
    const indices = eventNames.map((name) => trackedEventNames.indexOf(name));

    // Check all events were found
    if (indices.includes(-1)) {
      return false;
    }

    // Check they're in order
    for (let i = 1; i < indices.length; i++) {
      if ((indices[i] ?? 0) <= (indices[i - 1] ?? 0)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get a summary of all tracked analytics
   */
  getSummary(): {
    events: number;
    users: number;
    pages: number;
    resets: number;
  } {
    return {
      events: this.trackedEvents.length,
      users: this.identifiedUsers.length,
      pages: this.trackedPages.length,
      resets: this.resetCount,
    };
  }
}

/**
 * Helper to set up mock analytics in tests
 * Replaces the real analytics service with a mock version
 *
 * @param owner - The test's owner object
 * @returns The mock provider instance for assertions
 */
export function setupMockAnalytics(owner: any): MockAnalyticsProvider {
  const mockProvider = new MockAnalyticsProvider();
  mockProvider.initialize({ enabled: true });

  // Get the analytics service and register the mock provider
  const analyticsService = owner.lookup('service:analytics');
  analyticsService.registerProvider(mockProvider);

  return mockProvider;
}
