import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class PaginationComponent extends Component {
  @tracked itemPerPageSelectOptions = this.defaultItemPerPageSelectOptions;
  @tracked offset = 1;

  get currentPageResults() {
    return this.args.results;
  }

  get defaultItemPerPageSelectOptions() {
    return this._resolveReceivedPageItemsCountOptions(
      this.args.itemPerPageSelectOptions
    );
  }

  get disableNext() {
    return this.offset === this.totalPages;
  }

  get disablePrev() {
    return this.offset === 1;
  }

  get endItemIdx() {
    return Math.min(
      this.startItemIdx + this.selectedItemsPerPage - 1,
      this.args.totalItems
    );
  }

  get nextAction() {
    return this._resolveFunctionProp(this.args.nextAction);
  }

  get onItemsPerPageChange() {
    return this._resolveFunctionProp(this.args.onPageItemsCountChange);
  }

  get prevAction() {
    return this._resolveFunctionProp(this.args.prevAction);
  }

  get selectedItemsPerPage() {
    return this.itemPerPageSelectOptions.find((item) => item.selected).value;
  }

  get startItemIdx() {
    return (this.offset - 1) * this.selectedItemsPerPage + 1;
  }

  get totalPages() {
    return Math.ceil(this.args.totalItems / this.selectedItemsPerPage);
  }

  @action
  onItemsPerPageSelect(event) {
    this._updatePageItemSelectOptions(event.target.value);
    this.onItemsPerPageChange({
      selectedItemsPerPage: this.selectedItemsPerPage,
    });
    this._resetOffset();
  }

  @action goToNextPage() {
    this.offset =
      this.offset < this.totalPages ? this.offset + 1 : this.totalPages;
    this.nextAction({
      selectedItemsPerPage: this.selectedItemsPerPage,
      offset: this.offset,
    });
  }

  @action goToPrevPage() {
    this.offset = this.offset > 1 ? this.offset - 1 : 1;
    this.prevAction({
      selectedItemsPerPage: this.selectedItemsPerPage,
      offset: this.offset,
    });
  }

  // Check if callback function props are valid before calls
  _resolveFunctionProp(value) {
    return value && typeof value === 'function' ? value : () => null;
  }

  // Check if received page items count items are valid
  _resolveReceivedPageItemsCountOptions(items) {
    const allReceivedItemsAreValid =
      Array.isArray(items) && items.every((item) => !isNaN(Number(item)));
    const defaultItems = allReceivedItemsAreValid
      ? items
      : [10, 20, 30, 40, 40];

    return defaultItems.map((option, idx) => ({
      selected: idx === 0 || false,
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
    this.offset = 1;
  }
}
