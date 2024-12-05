import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { TypographyVariant, TypographyColors } from '../ak-typography';
import styles from './index.scss';

type LabelTypographyVariant = TypographyVariant;
type LabelTypographyColor = TypographyColors;

export interface AkAutocompleteSignature<T> {
  Element: HTMLElement;
  Args: {
    formControlClass?: string;
    textFieldRootClass?: string;
    id?: string;
    label?: string;
    labelTypographyVariant?: LabelTypographyVariant;
    labelTypographyColor?: LabelTypographyColor;
    required?: boolean;
    type?: string;
    value?: string;
    placeholder?: string;
    autofocus?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    helperText?: string;
    error?: boolean;
    renderInPlace?: boolean;
    searchQuery: string;
    options: (T | string)[];
    onChange(searchQuery: string, event: Event | null): void;
    onClear?(searchQuery: string, event: MouseEvent): void;
    loading?: boolean;
    filterKey?: keyof T;
    filterFn?(item: T | string): boolean;
    setInputValueFn?(item: T | string): string;
  };
  Blocks: {
    default: [option: T | string];
    loading?: [];
    empty?: [];
  };
}

export default class AkAutocompleteComponent<T> extends Component<
  AkAutocompleteSignature<T>
> {
  @tracked anchorRef: HTMLElement | null = null;

  constructor(owner: unknown, args: AkAutocompleteSignature<T>['Args']) {
    super(owner, args);

    // "setInputValueFn" is important to set the value of the input field when a custom filter fn is opted for
    if (this.args.filterFn && !this.args.setInputValueFn) {
      throw new Error(
        'You must provide a "setInputValueFn" handler along with a custom filter function.'
      );
    }
  }

  get textFieldRootClass() {
    return styles['ak-autocomplete-input-root'];
  }

  get filterKey() {
    return this.args.filterKey || 'label';
  }

  get searchQuery() {
    return this.args.searchQuery || '';
  }

  get options() {
    return this.args.options;
  }

  get filteredOptionsLastIndex() {
    return this.filteredOptions.length - 1;
  }

  get filteredOptions() {
    const query = this.searchQuery.toLowerCase();

    if (this.args.filterFn) {
      return (this.options as T[]).filter(this.args.filterFn);
    }

    return (this.options as (T | string)[]).filter((option) => {
      // If there is no filter key in option
      if (option && typeof option === 'object' && !(this.filterKey in option)) {
        throw new Error(
          'You should provide a filterKey with an object list or the object list options should have a "label" property in them.'
        );
      }

      // If there is a filter key
      if (option && typeof option === 'object' && this.filterKey in option) {
        return (option as Record<keyof T | string, string>)[this.filterKey]
          ?.toLowerCase()
          ?.includes(query);
      }

      // If menu options are strings
      if (typeof option === 'string') {
        return option.toLowerCase().includes(query);
      }

      // If there is no filter key and the list item is not a string
      return true;
    });
  }

  @action
  handleClick(event: FocusEvent) {
    this.anchorRef = event.currentTarget as HTMLElement;
  }

  @action
  handleOptionsClose() {
    this.anchorRef = null;
  }

  @action
  handleClear(event: MouseEvent) {
    if (this.args.onClear) {
      this.args.onClear(this.searchQuery, event);
    }

    this.args.onChange('', null);
  }

  @action
  handleInputChange(event: Event) {
    this.args.onChange((event.target as HTMLInputElement).value, event);
  }

  @action
  getInputValueFromOption(item: T | string) {
    // Needed when filtering list with a custom filter function
    if (this.args.setInputValueFn) {
      return this.args.setInputValueFn(item);
    }

    // When list items are objects and there's a filter key or when list items are strings
    let inputValue = '';

    if (item && typeof item === 'object' && this.filterKey in item) {
      inputValue =
        (item as Record<keyof T | string, string>)[this.filterKey] || '';
    } else {
      inputValue = (item as string) || '';
    }

    return inputValue;
  }

  @action
  onOptionClick(item: T | string) {
    const inputValue = this.getInputValueFromOption(item);

    this.args.onChange(inputValue, null);
    this.handleOptionsClose();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkAutocomplete: typeof AkAutocompleteComponent;
  }
}
