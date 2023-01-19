import Component from '@glimmer/component';
import { PaginationItemPerPageOptionProps } from '../ak-pagination-provider';

export interface AkPaginationSignature {
  Element: HTMLElement;
  Args: {
    currentPageResults: unknown[];
    disablePrev: boolean;
    totalItems: number;
    startItemIdx: number;
    endItemIdx: number;
    itemPerPageOptions: PaginationItemPerPageOptionProps[];
    selectedOption: PaginationItemPerPageOptionProps | undefined;
    onItemPerPageChange: (
      selectedItem: PaginationItemPerPageOptionProps
    ) => void;
    nextAction: () => void;
    prevAction: () => void;
    disableNext: boolean;
    tableItemLabel: string;
    nextBtnLabel: string;
    prevBtnLabel: string;
    perPageTranslation?: string;
  };
  Blocks: {
    default: [];
  };
}
export default class AkPaginationComponent extends Component<AkPaginationSignature> {
  noop() {}
}
