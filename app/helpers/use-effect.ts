import { Reactive, resource, resourceFactory, use } from 'ember-resources';
import { isEmpty, isEqual, xorWith } from 'lodash';
import { registerDestructor } from '@ember/destroyable';

/**
 * Extract the return types from an array of dependency functions
 */
export type UseEffectConfig<K> = {
  effect: EffectFn<K>;
  dependencies: Record<string, () => unknown>;
};

/**
 * Cleanup object with optional return value
 */
export type EffectCleanupObject<T> = {
  shouldRunCleanup?: () => boolean;
  cleanup?: () => void;
  returnValue?: T;
};

/**
 * Effect return types
 */
export type EffectReturnType<T> = void | EffectCleanupObject<T>;

/**
 * Effect function type
 */
export type EffectFn<K> = (deps: unknown[]) => EffectReturnType<K>;

/**
 * Assert that the effect result is a cleanup object
 * @param result - The effect result.
 * @returns True if the result is a cleanup object, false otherwise.
 */
const canRunCleanup = <T>(
  result: EffectReturnType<T>
): result is EffectCleanupObject<T> => {
  return (
    result !== null &&
    typeof result === 'object' &&
    'shouldRunCleanup' in result &&
    'cleanup' in result &&
    typeof result.shouldRunCleanup === 'function' &&
    typeof result.cleanup === 'function'
  );
};

/**
 * A resource that runs an effect when the dependencies change.
 * @param context - The context object.
 * @param effect - The effect function.
 * @param deps - The dependencies.
 * @returns The effect result.
 */
function effectResource<K>(context: object, config: UseEffectConfig<K>) {
  let prevDeps: unknown[] = [];
  let runOnceOnly = false;
  let previousEffectResult: K | undefined;
  let cleanup: (() => void) | undefined;

  // Cleanup the effect when the context is destroyed
  registerDestructor(context, () => cleanup?.());

  // Run the effect
  return resource(({ on }) => {
    const { effect, dependencies } = config;

    const depValues = Object.values(dependencies).map((fn) => fn());
    let effectResult: EffectReturnType<K> | undefined;

    // Run the effect once only if the dependencies are empty
    runOnceOnly = depValues.length === 0;

    if (runOnceOnly) {
      effectResult = effect(depValues);
      cleanup = effectResult?.cleanup;
    }

    // If the dependencies have changed, run the effect
    // This is done to avoid running the effect when the dependencies are the same
    // or when other component changes trigger the effect
    const depsChanged = !isEmpty(xorWith(depValues, prevDeps, isEqual));

    if (!runOnceOnly && depsChanged) {
      prevDeps = depValues;
      effectResult = effect(depValues);
      previousEffectResult = effectResult?.returnValue;
      cleanup = effectResult?.cleanup;
    }

    // Run the cleanup function if the effect result is a cleanup object
    const runCleanup = () => {
      if (canRunCleanup(effectResult) && effectResult.shouldRunCleanup?.()) {
        effectResult.cleanup?.();
      }
    };

    // Cleanup the effect when the resource is destroyed
    on.cleanup(() => runCleanup());

    // Return the previous effect result if the dependencies have not changed
    // If the dependencies have changed, return the new effect result
    return !depsChanged ? previousEffectResult : effectResult?.returnValue;
  });
}

const EffectResource = resourceFactory(effectResource);

/**
 * A resource that runs an effect when the dependencies change.
 * @param context - The context object.
 * @param effect - The effect function.
 * @param deps - The dependencies.
 * @returns The effect result.
 */
export function useEffect<K>(context: object, config: UseEffectConfig<K>) {
  return use(context, EffectResource(context, config)) as Reactive<K>;
}
