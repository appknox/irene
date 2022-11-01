import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class PaginationComponent extends Component {
  @tracked itemPerPageSelectOptions = this.defaultItemPerPageSelectOptions;
  @tracked offset = this.defaultOffset;

  get currentPageResults() {
    return this.args.results;
  }

  get limit() {
    return (
      this.itemPerPageSelectOptions.find((item) => item.selected)?.value ||
      this.itemPerPageSelectOptions[0].value
    );
  }

  get maxOffset() {
    const limit = this.limit;
    const total = this.args.totalItems || 0;
    if (total === 0) {
      return 0;
    }

    return Math.ceil(total / limit) - 1;
  } // `-1` because offset starts from 0

  get defaultItemPerPageSelectOptions() {
    return this._resolveReceivedPageItemsCountOptions(
      this.args.itemPerPageOptions,
      this.args.defaultLimit
    );
  }

  get disableNext() {
    return this.offset >= this.maxOffset;
  }

  get disablePrev() {
    return this.offset === 0;
  }

  get startItemIdx() {
    return this.offset * this.limit + 1;
  }

  get endItemIdx() {
    if (this.offset + 1 === this.totalPages) {
      return this.args.totalItems;
    }

    return (this.offset + 1) * this.limit;
  }

  get nextAction() {
    return this.args.nextAction;
  }

  get prevAction() {
    return this.args.prevAction;
  }

  get totalPages() {
    return Math.ceil(this.args.totalItems / this.limit);
  }

  get defaultOffset() {
    const offset = Math.floor(this.args.offset / this.limit);

    if (offset < 0) {
      return 0;
    }

    if (offset > this.totalPages) {
      return this.totalPages;
    }

    return offset;
  }

  get showPaginationNavBar() {
    return this.args.totalItems >= 1;
  }

  @action
  onItemsPerPageSelect(event) {
    this._updatePageItemSelectOptions(event.target.value);
    this._resetOffset();
    this.args.onPageItemsCountChange({
      limit: this.limit,
      offset: this.offset,
    });
  }

  @action goToNextPage() {
    this.offset = this.offset + 1;

    this.nextAction({
      limit: this.limit,
      offset: this.offset * this.limit,
    });
  }

  @action goToPrevPage() {
    this.offset = this.offset - 1;

    this.prevAction({
      limit: this.limit,
      offset: this.offset * this.limit,
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

  // Page offset reset handler
  _resetOffset() {
    this.offset = 0;
  }
}
