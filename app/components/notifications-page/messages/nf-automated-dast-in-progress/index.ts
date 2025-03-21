import Component from '@glimmer/component';
import type { NfAutomatedDastInProgressContext } from './context';

interface NotificationsPageMessagesNfAutomatedDastInProgressSignature {
  Args: {
    context: NfAutomatedDastInProgressContext;
  };
}

export default class NotificationsPageMessagesNfAutomatedDastInProgressComponent extends Component<NotificationsPageMessagesNfAutomatedDastInProgressSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'NotificationsPage::Messages::NfAutomatedDastInProgress': typeof NotificationsPageMessagesNfAutomatedDastInProgressComponent;
  }
}
