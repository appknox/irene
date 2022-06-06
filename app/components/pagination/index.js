import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class PaginationComponent extends Component {
  @tracked pageItemsCountSelectOptions = [
    {
      selected: true,
      value: 5,
    },
    {
      selected: false,
      value: 10,
    },
    {
      selected: false,
      value: 20,
    },
    {
      selected: false,
      value: 30,
    },
    {
      selected: false,
      value: 50,
    },
  ];

  @tracked currentPageNumber = 1;

  get totalPages() {
    return Math.ceil(this.args.totalItems / this.selectedItemsPerPage);
  }

  get startIndex() {
    return (this.currentPageNumber - 1) * this.selectedItemsPerPage + 1;
  }

  get endOffset() {
    return Math.min(
      this.startIndex + this.selectedItemsPerPage - 1,
      this.args.totalItems
    );
  }

  get selectedItemsPerPage() {
    return this.pageItemsCountSelectOptions.find((item) => item.selected).value;
  }

  get currentPageResults() {
    return this.args.results;
  }

  @action goToNextPage() {
    this.currentPageNumber =
      this.currentPageNumber < this.totalPages
        ? this.currentPageNumber + 1
        : this.totalPages;

    this.args.nextAction({
      startIdx: this.startIndex,
      endOffset: this.endOffset,
      selectedItemsPerPage: this.selectedItemsPerPage,
    });
  }

  @action goToPrevPage() {
    this.currentPageNumber =
      this.currentPageNumber > 1 ? this.currentPageNumber - 1 : 1;

    this.args.prevAction({
      startIdx: this.startIndex,
      endOffset: this.endOffset,
      selectedItemsPerPage: this.selectedItemsPerPage,
    });
  }

  @action
  onItemsPerPageSelect(event) {
    this.pageItemsCountSelectOptions = this.pageItemsCountSelectOptions.map(
      (item) => {
        if (item.value === Number(event.target.value)) {
          item.selected = true;
        } else {
          item.selected = false;
        }

        return item;
      }
    );

    if (this.currentPageNumber > this.args.totalPages) {
      this.currentPageNumber = this.totalPages;
    }

    this.args.onPageItemsCountChange({
      startIdx: this.startIndex,
      endOffset: this.endOffset,
      selectedItemsPerPage: this.selectedItemsPerPage,
    });
  }
}
