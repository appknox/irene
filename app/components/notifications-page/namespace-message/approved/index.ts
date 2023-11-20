import Component from '@glimmer/component';

export interface NotificationsPageNamespaceMessageApprovedSignature {
  Args: {
    moderaterName: string;
  };
}

export default class NotificationsPageNamespaceMessageApprovedComponent extends Component<NotificationsPageNamespaceMessageApprovedSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'NotificationsPage::NamespaceMessage::Approved': typeof NotificationsPageNamespaceMessageApprovedComponent;
  }
}
