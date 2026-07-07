import Component from '@glimmer/component';
import type { NfAutomatedDastPartiallyCompletedContext } from './context';

interface NotificationsPageMessagesNfAutomatedDastPartiallyCompletedSignature {
  Args: {
    context: NfAutomatedDastPartiallyCompletedContext;
  };
}

export default class NotificationsPageMessagesNfAutomatedDastPartiallyCompletedComponent extends Component<NotificationsPageMessagesNfAutomatedDastPartiallyCompletedSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'NotificationsPage::Messages::NfAutomatedDastPartiallyCompleted': typeof NotificationsPageMessagesNfAutomatedDastPartiallyCompletedComponent;
  }
}
