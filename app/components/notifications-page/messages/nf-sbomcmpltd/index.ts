import Component from '@glimmer/component';
import { type NfSbomcmpltdContext } from './context';

export interface NotificationsPageMessagesNfSbomcmpltdComponentArgs {
  Args: {
    context: NfSbomcmpltdContext;
  };
}

export default class NotificationsPageMessagesNfSbomcmpltdComponent extends Component<NotificationsPageMessagesNfSbomcmpltdComponentArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-sbomcmpltd': typeof NotificationsPageMessagesNfSbomcmpltdComponent;
  }
}
