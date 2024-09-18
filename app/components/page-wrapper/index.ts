import Component from '@glimmer/component';

interface PageWrapperSignature {
  Blocks: {
    default: [];
  };
}

export default class PageWrapperComponent extends Component<PageWrapperSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    PageWrapper: typeof PageWrapperComponent;
  }
}
