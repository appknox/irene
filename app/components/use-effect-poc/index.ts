import Component from '@glimmer/component';

export default class UseEffectPocComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    UseEffectPoc: typeof UseEffectPocComponent;
  }
}
