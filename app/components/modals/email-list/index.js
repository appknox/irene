import Component from "@glimmer/component";
import { action, computed } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { isArray } from '@ember/array';

export default class EmailList extends Component {

  @tracked showEmailModal = false;

  @computed('args.defaultCount')
  get defaultCount() {
    return this.args.defaultCount || 1;
  }

  @computed('args.emails')
  get emails() {
    return isArray(this.args.emails) ? this.args.emails : [this.args.emails];
  }

  @computed('defaultCount', 'emails.length')
  get remainingCount() {
    return this.emails.length - this.defaultCount;
  }

  @computed('emails', 'defaultCount')
  get defaultEmails() {
    return this.emails.slice(0, this.defaultCount).join(', ');
  }

  @computed('args.headerTitle')
  get modalHeaderTitle() {
    return this.args.headerTitle || "Email List";
  }

  @action
  toggleMoreEmailsModal() {
    this.showEmailModal = !this.showEmailModal;
  }
}
