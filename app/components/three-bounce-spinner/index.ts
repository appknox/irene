import Component from '@glimmer/component';

interface ThreeBounceSpinnerComponentSignature {
  Element: HTMLElement;
}

export default class ThreeBounceSpinnerComponent extends Component<ThreeBounceSpinnerComponentSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    ThreeBounceSpinner: typeof ThreeBounceSpinnerComponent;
  }
}
