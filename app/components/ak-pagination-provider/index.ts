import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import { DS } from 'ember-data';

type ResultDependency =
  | string // e.g., "search", "category", etc.
  | number // e.g., for pagination, limit, etc.
  | boolean // e.g., isActive, sortOrder, etc.
  | string[] // e.g., tags, selected categories, etc.
  | number[] // e.g., multiple selected IDs
  | null; // Nullable params (e.g., optional filters)

export type PaginationProviderActionsArgs = { limit: number; offset: number };

export type PaginationItemPerPageOptionProps = {
  selected: boolean;
  value: number;
  label: number;
};

interface PaginationProviderDefaultBlockHash<R> {
  currentPageResults: R[] | DS.AdapterPopulatedRecordArray<R> | undefined;
  disablePrev: boolean;
  totalItems: number;
  startItemIdx: number;
  endItemIdx: number;
  itemPerPageOptions: PaginationItemPerPageOptionProps[];
  selectedOption?: PaginationItemPerPageOptionProps;
  onItemPerPageChange: (args: PaginationItemPerPageOptionProps) => void;
  nextAction: () => void;
  prevAction: () => void;
  disableNext: boolean;
}

export interface AkPaginationProviderSignature<R> {
  Element: HTMLDivElement;
  Args: {
    results: R[] | DS.AdapterPopulatedRecordArray<R> | undefined;
    offset: number;
    totalItems: number;
    itemPerPageOptions: number[];
    defaultLimit: number;
    resultDependencies?: ResultDependency[];
    onItemPerPageChange: (args: PaginationProviderActionsArgs) => void;
    nextAction: (args: PaginationProviderActionsArgs) => void;
    prevAction: (args: PaginationProviderActionsArgs) => void;
    onResultDependenciesChange?: () => void;
  };
  Blocks: { default: [PaginationProviderDefaultBlockHash<R>] };
}

export default class AkPaginationProviderComponent<R> extends Component<
  AkPaginationProviderSignature<R>
> {
  // Default pagePerItem options if not provided
  DEFAULT_SELECT_OPTIONS = [5, 10, 20, 30, 40];

  @tracked itemPerPageOptions: PaginationItemPerPageOptionProps[] =
    this.defaultItemPerPageOptions;

  get resultDependencies() {
    return (
      this.args.resultDependencies ?? [this.args.offset, this.args.defaultLimit]
    );
  }

  get currentPageResults() {
    return this.args.results;
  }

  get offset() {
    if (this.args.offset > this.maxOffset) {
      return this.maxOffset;
    }
    return this.args.offset;
  }

  get totalCount() {
    return this.args.totalItems || 0;
  }

  // NOTE: 5 was chosen because if no itemPerPageOptions is passed to the pagination
  // the default itemPerPageOptions become [5, 10, 20, 30, 40] and 5 is the first item

  get limit() {
    return (
      this.itemPerPageOptions.find((item) => item.selected)?.value ||
      this.itemPerPageOptions[0]?.value ||
      5
    );
  }

  get maxOffset() {
    return this.totalCount;
  }

  get defaultItemPerPageOptions() {
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
    return Math.min(this.offset + this.limit, this.maxOffset);
  }

  get totalPages() {
    return Math.ceil(this.totalCount / Math.max(this.limit, 1));
  }

  get showPaginationNavBar() {
    return this.args.totalItems >= 1;
  }

  get selectedOption() {
    return (
      this.itemPerPageOptions.find((item) => item.selected) ||
      this.itemPerPageOptions[0]
    );
  }

  @action
  handleResultDependenciesChange() {
    this.args.onResultDependenciesChange?.();
  }

  @action
  onItemPerPageChange(selectedItem: PaginationItemPerPageOptionProps) {
    this._updatePageItemSelectOptions(Number(selectedItem.value));
    this.args.onItemPerPageChange({ limit: this.limit, offset: 0 });
  }

  @action nextAction() {
    this.args.nextAction({
      limit: this.limit,
      offset: this.offset + this.limit,
    });
  }

  @action prevAction() {
    this.args.prevAction({
      limit: this.limit,
      offset: this.offset - this.limit,
    });
  }

  // Check if received page items count items are valid
  _resolveReceivedPageItemsCountOptions(
    items = this.DEFAULT_SELECT_OPTIONS,
    defaultLimit = items[0]
  ) {
    const allReceivedItemsAreValid =
      Array.isArray(items) && items.every((item) => !isNaN(Number(item)));

    const defaultItems = allReceivedItemsAreValid
      ? items
      : this.DEFAULT_SELECT_OPTIONS;

    return defaultItems.map((option) => ({
      selected: Number(option) === defaultLimit || false,
      value: option,
      label: option,
    }));
  }

  // Handler for updating selected items per page
  _updatePageItemSelectOptions(value: number) {
    this.itemPerPageOptions = this.itemPerPageOptions.map((item) => {
      if (item.value === Number(value)) {
        item.selected = true;
      } else {
        item.selected = false;
      }

      return item;
    });
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkPaginationProvider: typeof AkPaginationProviderComponent;
  }
}
