import Component from '@glimmer/component';
import { useEffect, UseEffectConfig } from 'irene/helpers/use-effect';

export interface UseEffectSignature<K> {
  Args: UseEffectConfig<K> & { context?: object };
  Blocks: { default: [] };
}

export default class UseEffectComponent<K> extends Component<
  UseEffectSignature<K>
> {
  effect = useEffect(this.context, {
    effect: this.args.effect,
    dependencies: this.args.dependencies,
  });

  get context() {
    return this.args.context ? this.args.context : (this as object);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    UseEffect: typeof UseEffectComponent;
  }
}
