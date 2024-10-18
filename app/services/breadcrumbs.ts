import Service, { service } from '@ember/service';
import { assert } from '@ember/debug';
import { tracked } from '@glimmer/tracking';
import type RouterService from '@ember/routing/router-service';

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
  @service declare router: RouterService;

  @tracked container: BreadCrumbsContainer | null = null;

  /**
   * Registers a breadcrumb container.
   * @param {BreadCrumbsContainer} container - The container to be registered.
   * @throws Will throw an error if a container is already registered.
   */
  registerContainer(container: BreadCrumbsContainer) {
    assert(
      'A breadcrumb container is already registered. You cannot register multiple containers.',
      this.container === null // Checks if a container already exists
    );

    this.container = container;
  }

  /**
   * Unregisters a breadcrumb container.
   */
  unregisterContainer() {
    this.container = null;
  }

  /**
   * Replaces the previous child item in the breadcrumb container.
   * @param {BreadCrumbsItem} item - The breadcrumb item to replace previous item with.
   */
  replacePreviousItem(item: BreadCrumbsItem) {
    if (!this.container) {
      return;
    }

    const container = this.container;

    const containerChildren = [
      ...(container?.element.children as HTMLCollection),
    ];

    const itemToBeReplaced = containerChildren.find((it) => it.id === item.id);

    this._replacePreviousSibling(itemToBeReplaced, container);
    this.container = container;
  }

  /**
   * Gets the page referrer.
   * @template T
   * @param {boolean} [fromParent=false] - Whether to get the referrer from the parent route.
   * @returns {T} The page referrer.
   */
  getPageReferrer<T extends string>(fromParent?: boolean): T {
    const currentRoute = this.router.currentRoute;

    if (fromParent) {
      return currentRoute?.parent?.queryParams?.['referrer'] as T;
    }

    return currentRoute?.queryParams?.['referrer'] as T;
  }

  /**
   * Replaces the previous sibling of an element in the container.
   * @param {Element} [itemToBeReplaced] - The element to replace with.
   * @param {BreadCrumbsContainer} container - The container holding the elements.
   */
  _replacePreviousSibling(
    itemToBeReplaced: Element | undefined,
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
}

declare module '@ember/service' {
  interface Registry {
    breadcrumbs: BreadcrumbsService;
  }
}
