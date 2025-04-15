import Component from '@glimmer/component';

export default class AdminServiceAccountEmptyComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Admin::ServiceAccount::Empty': typeof AdminServiceAccountEmptyComponent;
  }
}
