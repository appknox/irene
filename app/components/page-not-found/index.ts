import Component from '@glimmer/component';

export default class PageNotFoundComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    PageNotFound: typeof PageNotFoundComponent;
  }
}
