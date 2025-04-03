import Component from '@glimmer/component';
import type { NfAutomatedDastCompletedContext } from './context';

interface NotificationsPageMessagesNfAutomatedDastCompletedSignature {
  Args: {
    context: NfAutomatedDastCompletedContext;
  };
}

export default class NotificationsPageMessagesNfAutomatedDastCompletedComponent extends Component<NotificationsPageMessagesNfAutomatedDastCompletedSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'NotificationsPage::Messages::NfAutomatedDastCompleted': typeof NotificationsPageMessagesNfAutomatedDastCompletedComponent;
  }
}
