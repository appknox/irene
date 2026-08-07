import Component from '@glimmer/component';
import { type NfSbomVulnUpdateContext } from './context';

export interface NotificationsPageMessagesNfSbomVulnUpdateComponentArgs {
  Args: {
    context: NfSbomVulnUpdateContext;
  };
}

export default class NotificationsPageMessagesNfSbomVulnUpdateComponent extends Component<NotificationsPageMessagesNfSbomVulnUpdateComponentArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-sbom-vuln-update': typeof NotificationsPageMessagesNfSbomVulnUpdateComponent;
  }
}
