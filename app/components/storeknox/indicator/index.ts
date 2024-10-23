import Component from '@glimmer/component';

export default class StoreknoxIndicatorComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Indicator': typeof StoreknoxIndicatorComponent;
  }
}
