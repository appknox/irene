import Component from '@glimmer/component';

export interface PaginationSignature {
  Args: {
    hasPrevious: boolean;
    hasNext: boolean;
    preDot: boolean;
    postDot: boolean;
    offset: number;
    pages: number[];
    gotoPage: (page: number) => void;
    gotoPageFirst: () => void;
    gotoPagePrevious: () => void;
    gotoPageNext: () => void;
    gotoPageLast: () => void;
  };
}

export default class PaginationComponent extends Component<PaginationSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    Pagination: typeof PaginationComponent;
  }
}
