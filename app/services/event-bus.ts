import Service from '@ember/service';
import Evented from '@ember/object/evented';
import type AnalysisOverviewModel from 'irene/models/analysis-overview';
import type { EmberMethod } from 'ember/-private/type-utils';

/**
 * Maps event names to their parameter types.
 * Add new events here to get type-safe event handling throughout the application.
 */
export interface EventBusEventMap {
  /** Triggered when a new message for websocket message for analysis-overview is received */
  'ws:analysis-overview:update': [analysis: AnalysisOverviewModel];
}

type EventBusSupportedEventNames = keyof EventBusEventMap;
type EventBusMethodFn = (...args: unknown[]) => void;

type EventBusHandlerFn<K extends EventBusSupportedEventNames> = (
  ...args: EventBusEventMap[K]
) => void;

export default class EventBusService extends Service.extend(Evented) {
  /**
   * Triggers a type-safe event with the specified name and arguments.
   *
   * @template K - The event name from the supported event names
   * @param {K} eventName - The name of the event to trigger
   * @param {EventBusEventMap[K]} args - The arguments specific to this event type
   * @returns {void}
   *
   * @example
   * // Trigger with type-safe parameters
   * this.eventBus.trigger('analysis:created', analysisModel);
   *
   * @example
   * // Multiple parameters
   * this.eventBus.trigger('scan:completed', 'file-123', 'static');
   */
  trigger<K extends EventBusSupportedEventNames>(
    eventName: K,
    ...args: EventBusEventMap[K]
  ): void;

  /**
   * Triggers an event with the specified name and arguments.
   * This is the implementation that handles all trigger calls.
   *
   * @param {string} eventName - The name of the event to trigger
   * @param {unknown[]} args - Variable arguments to pass to event handlers
   * @returns {this} Returns this for method chaining
   */
  trigger(eventName: string, ...args: unknown[]): this {
    return super.trigger(eventName, ...args);
  }

  /**
   * Subscribes to a named event with the given method.
   * Original Ember signature without target.
   *
   * @param {string} name - The name of the event
   * @param {EmberMethod<this>} method - The method to call on this service
   * @returns {this} Returns this for method chaining
   */
  on(name: string, method: EmberMethod<this>): this;

  /**
   * Subscribes to a type-safe named event with a typed handler function.
   *
   * @template K - The event name from the supported event names
   * @param {K} eventName - The name of the event to subscribe to
   * @param {object} target - The context object (usually `this`)
   * @param {EventBusHandlerFn<K>} handler - The typed handler function for this event
   * @returns {this} Returns this for method chaining
   *
   * @example
   * // Subscribe with type-safe handler
   * this.eventBus.on('analysis:created', this, (analysis) => {
   *   console.log(analysis.id); // analysis is typed as AnalysisOverviewModel
   * });
   *
   * @example
   * // Subscribe to event with multiple parameters
   * this.eventBus.on('scan:completed', this, (fileId, scanType) => {
   *   console.log(fileId, scanType); // Both are typed as string
   * });
   */
  on<K extends EventBusSupportedEventNames>(
    eventName: K,
    target: object,
    handler: EventBusHandlerFn<K>
  ): this;

  /**
   * Implementation for subscribing to events.
   * Handles both Ember's original signatures and type-safe subscriptions.
   *
   * @param {string} name - The name of the event
   * @param {object | EmberMethod<this>} targetOrMethod - Either the target object or the method
   * @param {EventBusMethodFn} [method] - Optional method if target was provided
   * @returns {this} Returns this for method chaining
   */
  on(
    name: string,
    targetOrMethod: object | EmberMethod<this>,
    method?: EventBusMethodFn
  ): this {
    if (method) {
      return super.on(name, targetOrMethod, method);
    }

    return super.on(name, targetOrMethod as EmberMethod<this>);
  }

  /**
   * Unsubscribes from a named event.
   * Original Ember signature without target.
   *
   * @param {string} name - The name of the event
   * @param {EmberMethod<this>} [method] - Optional method to unsubscribe (unsubscribes all if omitted)
   * @returns {this} Returns this for method chaining
   */
  off(name: string, method?: EmberMethod<this>): this;

  /**
   * Unsubscribes from a type-safe named event.
   *
   * @template K - The event name from the supported event names
   * @param {K} eventName - The name of the event to unsubscribe from
   * @param {object} target - The context object (usually `this`)
   * @param {EventBusHandlerFn<K>} [handler] - Optional specific handler to remove (removes all if omitted)
   * @returns {this} Returns this for method chaining
   *
   * @example
   * // Unsubscribe specific handler
   * this.eventBus.off('analysis:created', this, this.handleAnalysisCreated);
   *
   * @example
   * // Unsubscribe all handlers for this target
   * this.eventBus.off('analysis:created', this);
   */
  off<K extends EventBusSupportedEventNames>(
    eventName: K,
    target: object,
    handler?: EventBusHandlerFn<K>
  ): this;

  /**
   * Implementation for unsubscribing from events.
   * Handles both Ember's original signatures and type-safe unsubscriptions.
   *
   * @param {string} name - The name of the event
   * @param {object | EmberMethod<this>} [targetOrMethod] - Either the target object or the method
   * @param {EventBusMethodFn} [method] - Optional method if target was provided
   * @returns {this} Returns this for method chaining
   */
  off(
    name: string,
    targetOrMethod?: object | EmberMethod<this>,
    method?: EventBusMethodFn
  ): this {
    if (method) {
      return super.off(name, targetOrMethod, method);
    }

    return super.off(name, targetOrMethod as EmberMethod<this>);
  }
}
