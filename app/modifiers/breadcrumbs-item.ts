import { inject as service } from '@ember/service';
import Modifier from 'ember-modifier';
import BreadcrumbsService from 'irene/services/breadcrumbs';

export interface BreadcrumbsItemModifierArgs {
  Named: {
    id: string;
    replace?: boolean;
  };
  Positional: null;
}

export interface BreadcrumbsItemModifierSignature {
  Element: HTMLLIElement;
  Args: BreadcrumbsItemModifierArgs;
}

export default class BreadcrumbsItemModifier extends Modifier<BreadcrumbsItemModifierSignature> {
  @service('breadcrumbs') declare breadcrumbsService: BreadcrumbsService;

  modify(
    element: HTMLLIElement,
    _positional: BreadcrumbsItemModifierSignature['Args']['Positional'],
    { id, replace }: BreadcrumbsItemModifierSignature['Args']['Named']
  ) {
    if (replace) {
      this.breadcrumbsService.replaceItem({ element, id, replace });
    }
  }
}
