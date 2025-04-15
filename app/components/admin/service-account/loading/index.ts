import Component from '@glimmer/component';

export default class AdminServiceAccountLoadingComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Admin::ServiceAccount::Loading': typeof AdminServiceAccountLoadingComponent;
  }
}
