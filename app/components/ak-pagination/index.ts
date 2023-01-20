import Component from '@glimmer/component';
import { PaginationItemPerPageOptionProps } from '../ak-pagination-provider';
import styles from './index.scss';

export interface AkPaginationSignature {
  Element: HTMLDivElement;
  Args: {
    disablePrev?: boolean;
    disableNext?: boolean;
    totalItems?: number;
    startItemIdx?: number;
    endItemIdx?: number;
    itemPerPageOptions: PaginationItemPerPageOptionProps[];
    selectedOption?: PaginationItemPerPageOptionProps;
    onItemPerPageChange?: (
      selectedItem: PaginationItemPerPageOptionProps
    ) => void;
    nextAction?: () => void;
    prevAction?: () => void;
    tableItemLabel?: string;
    nextBtnLabel?: string;
    prevBtnLabel?: string;
    perPageTranslation?: string;
    variant?: 'default' | 'compact';
    paginationSelectOptionsVertPosition?: 'above' | 'below' | 'auto';
  };
}
export default class AkPaginationComponent extends Component<AkPaginationSignature> {
  noop() {}

  get classes() {
    return {
      selectClass: styles['ak-pagination-select'],
      prevButtonIconClass: styles['ak-pagination-button-prev-icon'],
      nextButtonIconClass: styles['ak-pagination-button-next-icon'],
    };
  }

  get variant() {
    return this.args.variant || 'default';
  }

  get isCompactPagination() {
    return this.variant === 'compact';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkPagination: typeof AkPaginationComponent;
  }
}
