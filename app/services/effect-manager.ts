import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { registerDestructor } from '@ember/destroyable';

interface EffectOptions {
  immediate?: boolean;
}

interface EffectState {
  id: number;
  effectFn: () => (() => void) | void;
  dependencies: unknown[];
  cleanup: (() => void) | null;
  options: EffectOptions;
}

interface EffectOwner {
  _effects?: Map<number, EffectState>;
}

export default class EffectManagerService extends Service {
  @tracked effectId = 0;

  registerEffect(
    owner: EffectOwner,
    effectFn: () => (() => void) | void,
    dependencies: unknown[] = [],
    options: EffectOptions = {}
  ): number {
    const id = this.effectId++;
    const state: EffectState = {
      id,
      effectFn,
      dependencies: [...dependencies],
      cleanup: null,
      options,
    };

    // Store effect state on the owner
    if (!owner._effects) {
      owner._effects = new Map();

      registerDestructor(owner, () => {
        owner._effects?.forEach((effect) => {
          if (effect.cleanup) {
            effect.cleanup();
          }
        });
        owner._effects?.clear();
      });
    }

    owner._effects.set(id, state);

    // Run effect immediately or schedule it
    this.runEffect(state);

    return id;
  }

  updateEffect(
    owner: EffectOwner,
    id: number,
    newDependencies: unknown[]
  ): void {
    if (!owner._effects || !owner._effects.has(id)) {
      return;
    }

    const effect = owner._effects.get(id)!;
    const depsChanged = this.dependenciesChanged(
      effect.dependencies,
      newDependencies
    );

    if (depsChanged) {
      effect.dependencies = [...newDependencies];
      this.runEffect(effect);
    }
  }

  private runEffect(effectState: EffectState): void {
    const runFn = (): void => {
      if (effectState.cleanup) {
        effectState.cleanup();
      }
      const cleanup = effectState.effectFn();
      effectState.cleanup = typeof cleanup === 'function' ? cleanup : null;
    };

    if (effectState.options.immediate) {
      runFn();
    } else {
      queueMicrotask(runFn);
    }
  }

  private dependenciesChanged(prev: unknown[], next: unknown[]): boolean {
    if (!prev || prev.length !== next.length) {
      return true;
    }
    return prev.some((dep, i) => dep !== next[i]);
  }
}
