import Component from "@glimmer/component";
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { isArray } from '@ember/array';

export default class EmailList extends Component {

  @tracked showEmailModal = false;

  get defaultCount() {
    return this.args.defaultCount || 1;
  }

  get emails() {
    return isArray(this.args.emails) ? this.args.emails : [this.args.emails];
  }

  get remainingCount() {
    return this.emails.length - this.defaultCount;
  }

  get defaultEmails() {
    return this.emails.slice(0, this.defaultCount).join(', ');
  }

  get modalHeaderTitle() {
    return this.args.headerTitle || "Email List";
  }

  @action
  toggleMoreEmailsModal() {
    this.showEmailModal = !this.showEmailModal;
  }
}
