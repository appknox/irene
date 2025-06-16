import { modifier } from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';
import { runTask } from 'ember-lifeline';
import { isEqual } from 'lodash';

interface EffectState {
  prevDependencies: unknown[] | null;
  cleanup: (() => void) | null;
  isFirstRun: boolean;
}

interface UseEffectModifierState {
  state?: EffectState;
}

interface UseEffectSignature {
  Args: {
    Positional: [
      () => (() => void) | void | Promise<(() => void) | void>,
      unknown[]?,
    ];
  };
  Element: Element;
}

/**
 * This modifier is a simple implementation of the useEffect hook.
 * It is used to run a function when the dependencies change.
 *
 * @param effectFn - The function to run when the dependencies change.
 * @param dependencies - The dependencies to watch.
 * @returns A cleanup function to run when the component is destroyed.
 */
const useEffectModifier = modifier<UseEffectSignature>(function useEffect(
  this: UseEffectModifierState,
  _element: Element,
  [effectFn, dependencies = []]: UseEffectSignature['Args']['Positional']
) {
  const state =
    this.state ||
    (this.state = {
      prevDependencies: null,
      cleanup: null,
      isFirstRun: true,
    });

  // Dependency comparison using lodash for deep equality
  const depsChanged =
    !state.prevDependencies ||
    dependencies.length !== state.prevDependencies.length ||
    !isEqual(dependencies, state.prevDependencies);

  if (state.isFirstRun || depsChanged) {
    // Cleanup previous effect
    if (state.cleanup && typeof state.cleanup === 'function') {
      state.cleanup();
      state.cleanup = null;
    }

    // Schedule new effect using runTask for proper timing
    const runEffect = (): void => {
      runTask(this, async () => {
        if (typeof effectFn === 'function') {
          try {
            const cleanup = await effectFn();
            state.cleanup = typeof cleanup === 'function' ? cleanup : null;
          } catch (error) {
            console.error('Error in useEffect:', error);
          }
        }
      });
    };

    runEffect();

    state.prevDependencies = [...dependencies];
    state.isFirstRun = false;
  }

  registerDestructor(this, () => {
    if (state.cleanup && typeof state.cleanup === 'function') {
      state.cleanup();
    }
  });
});

export default useEffectModifier;

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'use-effect': typeof useEffectModifier;
  }
}
