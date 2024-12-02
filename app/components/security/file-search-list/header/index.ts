import Component from '@glimmer/component';

export default class SecurityFileSearchListHeaderComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::FileSearchList::Header': typeof SecurityFileSearchListHeaderComponent;
  }
}
