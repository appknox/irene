import Component from '@glimmer/component';

export default class OffensiveSecurityUpsellingComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::Upselling': typeof OffensiveSecurityUpsellingComponent;
    'offensive-security/upselling': typeof OffensiveSecurityUpsellingComponent;
  }
}
