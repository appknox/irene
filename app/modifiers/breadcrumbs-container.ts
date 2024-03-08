import { inject as service } from '@ember/service';
import { registerDestructor } from '@ember/destroyable';
import Owner from '@ember/owner';
import Modifier from 'ember-modifier';
import BreadcrumbsService from 'irene/services/breadcrumbs';
import type { BreadCrumbsContainer } from 'irene/services/breadcrumbs';

export interface BreadcrumbsContainerModifierArgs {
  Named: {
    id?: string;
  };
  Positional: [];
}

export interface BreadcrumbsContainerModifierSignature {
  Element: HTMLUListElement;
  Args: BreadcrumbsContainerModifierArgs;
}

export default class BreadcrumbsContainerModifier extends Modifier<BreadcrumbsContainerModifierSignature> {
  @service('breadcrumbs') declare breadcrumbsService: BreadcrumbsService;

  container: BreadCrumbsContainer | null = null;

  constructor(
    owner: Owner,
    args: {
      named: BreadcrumbsContainerModifierSignature['Args']['Named'];
      positional: BreadcrumbsContainerModifierSignature['Args']['Positional'];
    }
  ) {
    super(owner, args);
    registerDestructor(this, unregisterContainer);
  }

  modify(
    element: HTMLUListElement,
    _positional: BreadcrumbsContainerModifierSignature['Args']['Positional'],
    { id }: BreadcrumbsContainerModifierSignature['Args']['Named']
  ) {
    this.container = {
      element,
      id,
    };

    this.breadcrumbsService.registerContainer(this.container);
  }
}

function unregisterContainer(instance: BreadcrumbsContainerModifier) {
  if (instance.container) {
    instance.breadcrumbsService.unregisterContainer(instance.container);
  }
}
