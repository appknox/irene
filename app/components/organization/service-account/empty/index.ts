import Component from '@glimmer/component';

export default class OrganizationServiceAccountEmptyComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::ServiceAccount::Empty': typeof OrganizationServiceAccountEmptyComponent;
  }
}
