import Component from '@glimmer/component';
import { type NfSbomCompUpdateContext } from './context';

export interface NotificationsPageMessagesNfSbomCompUpdateComponentArgs {
  Args: {
    context: NfSbomCompUpdateContext;
  };
}

export default class NotificationsPageMessagesNfSbomCompUpdateComponent extends Component<NotificationsPageMessagesNfSbomCompUpdateComponentArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-sbom-comp-update': typeof NotificationsPageMessagesNfSbomCompUpdateComponent;
  }
}
