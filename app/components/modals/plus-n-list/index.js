import Component from "@glimmer/component";
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { isArray } from '@ember/array';

export default class PlusNList extends Component {

  @tracked showMoreModal = false;

  get defaultCount() {
    return this.args.defaultCount || 1;
  }

  get list() {
    return isArray(this.args.list) ? this.args.list : [this.args.list];
  }

  get remainingCount() {
    return this.list.length - this.defaultCount;
  }

  get defaultItems() {
    return this.list.slice(0, this.defaultCount).join(', ');
  }

  @action
  toggleShowMoreModal() {
    this.showMoreModal = !this.showMoreModal;
  }
}
