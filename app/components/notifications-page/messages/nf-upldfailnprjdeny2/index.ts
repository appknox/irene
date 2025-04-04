import Component from '@glimmer/component';
import { type NfUpldfailnprjdeny2Context } from './context';

export interface NotificationsPageMessagesNfUpldfailnprjdeny2ComponentArgs {
  Args: {
    context: NfUpldfailnprjdeny2Context;
  };
}

export default class NotificationsPageMessagesNfUpldfailnprjdeny2Component extends Component<NotificationsPageMessagesNfUpldfailnprjdeny2ComponentArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-upldfailnprjdeny2': typeof NotificationsPageMessagesNfUpldfailnprjdeny2Component;
  }
}
