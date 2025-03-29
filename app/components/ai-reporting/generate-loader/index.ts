import Component from '@glimmer/component';

export default class GenerateLoaderComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::GenerateLoader': typeof GenerateLoaderComponent;
  }
}
