import Component from '@glimmer/component';

export interface FileChartSignature {
  Element: HTMLElement;
}

export default class FileChartLoadingComponent extends Component<FileChartSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileChart::Loading': typeof FileChartLoadingComponent;
  }
}
