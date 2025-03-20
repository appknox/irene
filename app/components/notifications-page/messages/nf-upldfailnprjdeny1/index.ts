import Component from '@glimmer/component';
import { type NfUpldfailnprjdeny1Context } from './context';

export interface NotificationsPageMessagesNfUpldfailnprjdeny1ComponentArgs {
  Args: {
    context: NfUpldfailnprjdeny1Context;
  };
}

export default class NotificationsPageMessagesNfUpldfailnprjdeny1Component extends Component<NotificationsPageMessagesNfUpldfailnprjdeny1ComponentArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-upldfailnprjdeny1': typeof NotificationsPageMessagesNfUpldfailnprjdeny1Component;
  }
}
