import Component from '@glimmer/component';

export default class StoreknoxComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    Storeknox: typeof StoreknoxComponent;
  }
}
