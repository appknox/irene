/* eslint-disable @typescript-eslint/no-explicit-any */
import { registerDestructor } from '@ember/destroyable';
import { addObserver, removeObserver } from '@ember/object/observers';
import { runTask } from 'ember-lifeline';

// Type for cleanup function
type CleanupFunction = () => void;

// Type for effect function that can return cleanup
type EffectFunction = () => CleanupFunction | void;

// Effect state interface
interface EffectState {
  cleanup?: CleanupFunction;
  method: EffectFunction;
  dependencies: string[];
  isFirstRun: boolean;
  propertyObservers: Set<string>;
  runEffect: () => void;
}

/**
 * Type for components that can have effects
 *
 * @param EFFECT_METADATA - Symbol to store effect metadata on the component
 * @param _effectSetupFunctions - Map to store effect setup functions
 * @param _initializeAllEffects - Function to initialize all effects
 *
 * @example
 * ```typescript
 * class MyComponent extends Component {
 *   @useEffect([])
 *   setupEffect() {
 *     console.log('Component mounted');
 *     return () => console.log('Component will unmount');
 *   }
 * }
 */
type EffectComponent = Record<string, any> & {
  [EFFECT_METADATA]?: Map<string, EffectState>;
  _effectSetupFunctions?: Map<string, EffectState>;
  _initializeAllEffects?: () => void;
};

/**
 * Wraps a constructor with the effect system
 * This is a workaround to ensure that the effect system is initialized after the constructor completes
 *
 * @param constructor - The constructor to wrap
 * @returns The wrapped constructor
 *
 * @example
 * ```typescript
 * @withEffects
 * class MyComponent extends Component {
 *   @useEffect([])
 *   setupEffect() {
 *     console.log('Component mounted');
 *     return () => console.log('Component will unmount');
 *   }
 * }
 */
export function withEffects<T extends { new (...args: any[]): object }>(
  constructor: T
) {
  return class extends constructor {
    constructor(...args: any[]) {
      super(...args);
      initializeEffectSystem.call(this);
    }
  };
}

// Symbol to store effect metadata on the component
const EFFECT_METADATA = Symbol('useEffect');

// Set to track components that have been initialized
const INITIALIZED_COMPONENTS = new WeakSet();

/**
 * useEffect decorator for components
 * Automatically sets up effects during component definition time.
 * We're basically creating a map of effect setup functions on the component on a private property.
 * This private property is called "_effectSetupFunctions" and is stored on the component instance.
 *
 * The map is keyed by the property name of the effect setup function.
 * The value is an object that contains the effect setup function, the dependencies, and the cleanup function.
 *
 * The effect setup function is the function that will be called when the effect should run.
 * The dependencies are the properties that the effect should listen to.
 *
 * @param dependencies - Array of property names to observe
 * @returns Method decorator
 *
 * @example
 * ```typescript
 * @useEffect([]) // Run once on mount
 * setupEffect() {
 *   console.log('Component mounted');
 *   return () => console.log('Component will unmount');
 * }
 *
 * @useEffect(['count', 'name']) // Run when count or name changes
 * dataEffect() {
 *   console.log('Data changed:', this.count, this.name);
 *   return () => console.log('Cleanup previous effect');
 * }
 * ```
 */
export function useEffect<T extends EffectComponent>(
  dependencies: (keyof T)[] = []
) {
  return function <K extends keyof T>(
    target: T,
    propertyKey: K,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value as EffectFunction;

    if (typeof originalMethod !== 'function') {
      throw new Error(
        `@useEffect can only be applied to methods. Applied to: ${String(propertyKey)}`
      );
    }

    // Create a local store for effect setup functions
    if (!target._effectSetupFunctions) {
      target._effectSetupFunctions = new Map();
    }

    // Store each effect setup function on the private "_effectSetupFunctions" map
    target._effectSetupFunctions.set(String(propertyKey), {
      dependencies: dependencies.map(String),
      method: originalMethod,
      isFirstRun: true,
      propertyObservers: new Set(),
      runEffect: () => {},
    });

    return descriptor;
  };
}

/**
 * Initializes the effect system for a component instance.
 * This step happens when the component is instantiated.
 *
 * @param this - The component instance
 * @returns void
 */

function initializeEffectSystem<T extends EffectComponent>(this: T) {
  /*
   * Return early if the component instance has already been initialized
   * This means that the effect system for this component has been already setup.
   */
  if (INITIALIZED_COMPONENTS.has(this)) {
    return;
  }

  // Initialization steps
  INITIALIZED_COMPONENTS.add(this);
  this[EFFECT_METADATA] = new Map<string, EffectState>();

  // Initialize all effects for the component instance
  runTask(this, () => initializeAllEffects.call(this));

  // Register destructor for cleanup on component destroy
  registerDestructor(this, () => {
    const effects = this[EFFECT_METADATA];

    // Return early if no effects are set
    if (!effects) {
      return;
    }

    effects.forEach((state) => {
      // Remove observers
      state.propertyObservers.forEach((prop) => {
        try {
          removeObserver(this, prop, null, state.runEffect);
        } catch (error) {
          console.warn(`Failed to remove observer for ${prop}:`, error);
        }
      });

      // Run cleanup
      if (state.cleanup) {
        state.cleanup();
      }
    });

    effects.clear();
    INITIALIZED_COMPONENTS.delete(this);
  });
}

/**
 * Initialize all effects for a component.
 * This step happens when the component is instantiated.
 *
 * We're basically running all component effects at least once and setting up observers for the
 * dependencies to rerun the effects when changes are detected.
 *
 * @param this - The component instance
 * @returns void
 */
function initializeAllEffects<T extends EffectComponent>(this: T) {
  // This was setup at the component definition time
  const setupFunctions = this._effectSetupFunctions;

  if (!setupFunctions) {
    return;
  }

  // Setup and run all effect functions and add observers for the dependencies
  setupFunctions.forEach((config, propertyKey) => {
    const effectKey = propertyKey;
    const effects = this[EFFECT_METADATA];

    effects?.set(effectKey, config);

    // Effect runner function
    config.runEffect = () => {
      // Cleanup previous effect
      if (config.cleanup) {
        config.cleanup();
        config.cleanup = undefined;
      }

      // Run the effect
      runTask(this, () => {
        try {
          const result = config.method.apply(this);

          if (typeof result === 'function') {
            config.cleanup = result;
          }
        } catch (error) {
          console.error(`Error in effect ${String(propertyKey)}:`, error);
        }
      });
    };

    // Setup observers for dependencies
    config.dependencies.forEach((dep) => {
      // Validate that the property exists on the component
      if (!(dep in this)) {
        console.warn(
          `Property '${dep}' not found on component for effect '${String(propertyKey)}'`
        );

        return;
      }

      // eslint-disable-next-line ember/no-observers
      addObserver(this, dep, null, config.runEffect);
      config.propertyObservers.add(dep);
    });

    // Run effect immediately for first time or empty dependencies
    if (config.dependencies.length === 0 || config.isFirstRun) {
      config.runEffect();
    }

    config.isFirstRun = false;
  });
}
