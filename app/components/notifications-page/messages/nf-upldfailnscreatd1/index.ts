import Component from '@glimmer/component';
import { type NfUpldfailnscreatd1Context } from './context';

export interface NotificationsPageMessagesNfUpldfailnscreatd1ComponentArgs {
  Args: {
    context: NfUpldfailnscreatd1Context;
  };
}

export default class NotificationsPageMessagesNfUpldfailnscreatd1Component extends Component<NotificationsPageMessagesNfUpldfailnscreatd1ComponentArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-upldfailnscreatd1': typeof NotificationsPageMessagesNfUpldfailnscreatd1Component;
  }
}
