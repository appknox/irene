import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

const TOTAL_DATA = Array.from({ length: 50 }, (_, i) => `Item ${i + 1}`);

export default class AkPaginationFreestyleDemoComponent extends Component {
  totalPaginationData = TOTAL_DATA;
  @tracked limit = 5;
  @tracked offset = 0;

  get tableData() {
    return this.totalPaginationData.slice(this.offset, this.limit + this.offset);
  }

  @action
  onItemPerPageChange(args: { limit: number; offset: number }) {
    this.limit = args.limit;
    this.offset = args.offset;
  }

  @action
  nextAction(args: { limit: number; offset: number }) {
    this.limit = args.limit;
    this.offset = args.offset;
  }

  @action
  prevAction(args: { limit: number; offset: number }) {
    this.limit = args.limit;
    this.offset = args.offset;
  }
}
