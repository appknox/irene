import Component from '@glimmer/component';

export default class OrganizationServiceAccountLoadingComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::ServiceAccount::Loading': typeof OrganizationServiceAccountLoadingComponent;
  }
}
