import Service from '@ember/service';
import { assert } from '@ember/debug';
import { tracked } from '@glimmer/tracking';

export interface BreadCrumbsContainer {
  readonly element: HTMLUListElement;
  id?: string;
}

export interface BreadCrumbsItem {
  readonly element: HTMLLIElement;
  id?: string;
  replace?: boolean;
}

export default class BreadcrumbsService extends Service {
  @tracked containers: BreadCrumbsContainer[] = [];

  _containers: BreadCrumbsContainer[] = [];

  registerContainer(container: BreadCrumbsContainer) {
    assert(
      'A breadcrumb container with the same DOM element has already been registered before.',
      !this._isContainerRegistered(container)
    );

    this._containers = [...this._containers, container];
    this.containers = this._containers;
  }

  unregisterContainer(container: BreadCrumbsContainer) {
    assert(
      'No breadcrumb container was found with this DOM element.',
      this._isContainerRegistered(container)
    );

    this._containers = this._containers.filter((registeredContainer) => {
      return container.element !== registeredContainer.element;
    });

    this.containers = this._containers;
  }

  replaceItem(item: BreadCrumbsItem) {
    this._containers = this._containers.map((container) => {
      const containerChildren = [
        ...container.element.children,
      ] as Array<HTMLElement>;

      const itemToBeReplaced = containerChildren.find(
        (child) => child.id === item.id
      );

      this._replacePreviousSibling(itemToBeReplaced, container);

      return container;
    });

    this.containers = this._containers;
  }

  _replacePreviousSibling(
    itemToBeReplaced: HTMLElement | undefined,
    container: BreadCrumbsContainer
  ) {
    if (!itemToBeReplaced) {
      return;
    }

    const previousSiblingElement = itemToBeReplaced.previousElementSibling;

    if (previousSiblingElement) {
      container.element.removeChild(previousSiblingElement);
    }
  }

  _isContainerRegistered(container: BreadCrumbsContainer) {
    return this._containers.some((registeredContainer) => {
      return container.id === registeredContainer.id;
    });
  }
}

declare module '@ember/service' {
  interface Registry {
    breadcrumbs: BreadcrumbsService;
  }
}
