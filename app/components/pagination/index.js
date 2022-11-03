import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class PaginationComponent extends Component {
  @tracked itemPerPageSelectOptions = this.defaultItemPerPageSelectOptions;

  get currentPageResults() {
    return this.args.results;
  }

  get offset() {
    if (this.args.offset > this.maxOffset) {
      return this.maxOffset;
    }
    return this.args.offset;
  }

  get nextAction() {
    return this.args.nextAction;
  }

  get prevAction() {
    return this.args.prevAction;
  }

  get totalCount() {
    return this.args.totalItems || 0;
  }

  get limit() {
    return (
      this.itemPerPageSelectOptions.find((item) => item.selected)?.value ||
      this.itemPerPageSelectOptions[0].value
    );
  }

  get maxOffset() {
    return this.totalCount;
  }

  get defaultItemPerPageSelectOptions() {
    return this._resolveReceivedPageItemsCountOptions(
      this.args.itemPerPageOptions,
      this.args.defaultLimit
    );
  }

  get disableNext() {
    const nextOffset = this.offset + this.limit;
    return nextOffset >= this.maxOffset;
  }

  get disablePrev() {
    return this.offset === 0;
  }

  get startItemIdx() {
    // offset is 0 indexed but we need it to be 1 indexed for display
    return this.offset + 1;
  }

  get endItemIdx() {
    // offset is 0 indexed but we need it to be 1 indexed for display
    return Math.min(this.offset + this.limit + 1, this.maxOffset);
  }

  get totalPages() {
    return Math.ceil(this.totalCount / Math.max(this.limit, 1));
  }

  get showPaginationNavBar() {
    return this.args.totalItems >= 1;
  }

  @action
  onItemsPerPageSelect(event) {
    this._updatePageItemSelectOptions(event.target.value);
    this.args.onPageItemsCountChange({
      limit: this.limit,
      offset: 0,
    });
  }

  @action goToNextPage() {
    this.nextAction({
      limit: this.limit,
      offset: this.offset + this.limit,
    });
  }

  @action goToPrevPage() {
    this.prevAction({
      limit: this.limit,
      offset: this.offset - this.limit,
    });
  }

  // Check if received page items count items are valid
  _resolveReceivedPageItemsCountOptions(
    items = [5, 10, 20, 30, 40],
    defaultLimit = items[0]
  ) {
    const allReceivedItemsAreValid =
      Array.isArray(items) && items.every((item) => !isNaN(Number(item)));
    const defaultItems = allReceivedItemsAreValid ? items : [5, 10, 20, 30, 40];

    return defaultItems.map((option) => ({
      selected: Number(option) === defaultLimit || false,
      value: Number(option),
    }));
  }

  // Handler for updating selected items per page
  _updatePageItemSelectOptions(value) {
    this.itemPerPageSelectOptions = this.itemPerPageSelectOptions.map(
      (item) => {
        if (item.value === Number(value)) {
          item.selected = true;
        } else {
          item.selected = false;
        }

        return item;
      }
    );
  }
}
