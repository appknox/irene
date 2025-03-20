import Component from '@glimmer/component';
import { type NfStrUrlUpldfailnsunaprv1Context } from './context';

export interface NotificationsPageMessagesNfStrUrlUpldfailnsunaprv1ComponentArgs {
  Args: {
    context: NfStrUrlUpldfailnsunaprv1Context;
  };
}

export default class NotificationsPageMessagesNfStrUrlUpldfailnsunaprv1Component extends Component<NotificationsPageMessagesNfStrUrlUpldfailnsunaprv1ComponentArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-str-url-upldfailnsunaprv1': typeof NotificationsPageMessagesNfStrUrlUpldfailnsunaprv1Component;
  }
}
