import Component from '@glimmer/component';
import { type NfStrUrlUpldfailnprjdeny2Context } from './context';

export interface NotificationsPageMessagesNfStrUrlUpldfailnprjdeny2ComponentArgs {
  Args: {
    context: NfStrUrlUpldfailnprjdeny2Context;
  };
}

export default class NotificationsPageMessagesNfStrUrlUpldfailnprjdeny2Component extends Component<NotificationsPageMessagesNfStrUrlUpldfailnprjdeny2ComponentArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-str-url-upldfailnprjdeny2': typeof NotificationsPageMessagesNfStrUrlUpldfailnprjdeny2Component;
  }
}
