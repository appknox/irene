import Component from '@glimmer/component';

import type { NfAutomatedDastErroredContext } from './context';

interface NotificationsPageMessagesNfAutomatedDastErroredSignature {
  Args: {
    context: NfAutomatedDastErroredContext;
  };
}

export default class NotificationsPageMessagesNfAutomatedDastErroredComponent extends Component<NotificationsPageMessagesNfAutomatedDastErroredSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'NotificationsPage::Messages::NfAutomatedDastErrored': typeof NotificationsPageMessagesNfAutomatedDastErroredComponent;
  }
}
