import { resource, resourceFactory, use } from 'ember-resources';

/**
 * Extract the return types from an array of dependency functions
 */
type DependencyValues<T extends (() => unknown)[]> = {
  [K in keyof T]: T[K] extends () => infer R ? R : never;
};

type EffectFn<T extends (() => unknown)[]> = (
  deps?: DependencyValues<T>
) => (() => void) | void | Promise<(() => void) | void>;

/**
 * A resource that runs an effect when the dependencies change.
 *
 * @param effect - The effect to run.
 * @param deps - The dependencies to watch.
 * @returns A resource that runs the effect when the dependencies change.
 */
function effectResource<T extends (() => unknown)[]>(
  effect: EffectFn<T>,
  deps: T
) {
  // Store the cleanup function
  let cleanup: (() => void) | null = null;

  return resource(({ on }) => {
    const runEffect = () => {
      // 1. Run previous cleanup if it exists
      if (cleanup) {
        cleanup();
        cleanup = null;
      }

      // 2. Run new effect
      const depsValues = deps.map((dep) => dep()) as DependencyValues<T>;
      const result = effect(depsValues);

      // 3. Store new cleanup function
      if (typeof result === 'function') {
        cleanup = result;
      }
    };

    // Run effect initially and on dependency changes
    runEffect();

    // Register final cleanup when resource is destroyed
    on.cleanup(() => {
      if (cleanup) {
        cleanup();
      }
    });
  });
}

const EffectResource = resourceFactory(effectResource);

/**
 * A resource that runs an effect when the dependencies change.
 * Returns a 'use' function can be used to use a Resource in component classes.
 *
 * @param context - The context to run the effect in.
 * @param effect - The effect to run.
 * @param deps - The dependencies to watch.
 * @returns A resource that runs the effect when the dependencies change.
 */
export function useEffect<T extends (() => unknown)[]>(
  context: object,
  effect: EffectFn<T>,
  deps: T
) {
  return use(context, EffectResource(effect, deps));
}
