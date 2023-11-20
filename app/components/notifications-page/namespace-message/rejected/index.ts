import Component from '@glimmer/component';

export default class NotificationsPageNamespaceMessageRejectedComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'NotificationsPage::NamespaceMessage::Rejected': typeof NotificationsPageNamespaceMessageRejectedComponent;
  }
}
