import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import type Controller from '@ember/controller';
import type RouteInfo from '@ember/routing/route-info';
import type RouterService from '@ember/routing/router-service';
import type Route from '@ember/routing/route';
import type Transition from '@ember/routing/transition';

export interface AkBreadcrumbsItemProps {
  title: string;
  route: string;
  isRootCrumb?: boolean;
  disabled?: boolean;
  models?: string[];
  query?: Record<string, unknown>;
  multiPageAccess?: boolean;
  stopCrumbGeneration?: boolean;
  siblingRoutes?: string[];
  parentCrumb?: Omit<AkBreadcrumbsItemProps, 'fallbackCrumbs'>;

  // Available route groups in irene
  routeGroup:
    | 'project/files'
    | 'sec-dashboard'
    | 'sbom'
    | 'organization'
    | 'storeknox/inventory'
    | 'storeknox/discovery';

  // Fallback crumbs when no context as to what route a user is coming from. Can also be useful when switching from one route group to another.
  fallbackCrumbs?: Array<
    Partial<Omit<AkBreadcrumbsItemProps, 'fallbackCrumbs' | 'group'>>
  >;
}

export type AkBreadcrumbsController = Controller & {
  breadcrumbs?: AkBreadcrumbsItemProps;
};

/**
 * Service for managing breadcrumb items in the application, including
 * generating, saving, and retrieving breadcrumbs from local storage.
 */
export default class AkBreadcrumbsService extends Service {
  @service declare router: RouterService;
  @service('browser/window') declare window: Window;

  @tracked breadcrumbItems: Partial<AkBreadcrumbsItemProps>[] = [];

  /**
   * Generates breadcrumb items for a given route.
   *
   * @param {RouteInfo} originRouteInfo - Information about the current route.
   * @param {Route} originRouteClass - The route class instance.
   * @param {Transition['from']} routeFrom - The transition object representing the originating route.
   * @returns {void}
   */
  @action generateBreadcrumbItems(
    originRouteInfo: RouteInfo,
    originRouteClass: Route,
    routeFrom: Transition['from']
  ): void {
    const originRouteName = originRouteClass.routeName;
    const items: Partial<AkBreadcrumbsItemProps>[] = [];
    let currentRouteInfo: RouteInfo | null = originRouteInfo;
    let isOriginRoute = true;

    const originRouteCtrller = this._getRouteController(
      originRouteName,
      originRouteClass,
      isOriginRoute
    );

    const originRouteCrumbProps =
      this._extractCrumbPropsFromCtrller(originRouteCtrller);

    // Reset breadcrumbs if you hit a root page. Allows for fresh crumbs regenration
    if (originRouteCrumbProps?.isRootCrumb) {
      this.breadcrumbItems = [];
      this._saveBreadcrumbItemsToLStorage([], originRouteName);

      return;
    }

    // Retriev bradcrumbs from local storage
    const retrievedCrumbs = this._retrieveStoredBreadcrumbs(
      originRouteClass,
      originRouteCtrller,
      routeFrom
    );

    // Return early if retrieval is successful
    if (retrievedCrumbs.length > 0) {
      this.breadcrumbItems = retrievedCrumbs;

      this._saveBreadcrumbItemsToLStorage(
        retrievedCrumbs,
        String(originRouteName)
      );

      return;
    }

    // When navigating from an external url to a page and no breadcrumbs was saved in local storage for that route
    // This assumes that there's no context as to where the user is coming from (routeFrom is undefined)
    const originRouteFallbackCrumbs =
      originRouteCrumbProps?.fallbackCrumbs?.map((it) => ({
        ...it,
        routeGroup: originRouteCrumbProps.routeGroup,
      }));

    if (
      !routeFrom &&
      originRouteFallbackCrumbs &&
      originRouteFallbackCrumbs.length > 0
    ) {
      this.breadcrumbItems = originRouteFallbackCrumbs;

      this._saveBreadcrumbItemsToLStorage(
        originRouteFallbackCrumbs,
        originRouteName
      );

      return;
    }

    // Regenerate new items if retrieval is unsuccessful and no fallback crumbs
    while (currentRouteInfo) {
      const routeController = isOriginRoute
        ? originRouteCtrller
        : this._getRouteController(currentRouteInfo.name, originRouteClass);

      const breadcrumbProps =
        this._extractCrumbPropsFromCtrller(routeController);

      if (breadcrumbProps?.title) {
        items.unshift({
          ...breadcrumbProps,
          route: isOriginRoute ? originRouteName : currentRouteInfo.name,
        });
      }

      // Stop generation if at last route
      if (breadcrumbProps?.stopCrumbGeneration) {
        break;
      }

      const currRouteInfo = this._getNextRouteForCrumbsGeneration(
        originRouteClass,
        currentRouteInfo,
        routeFrom,
        breadcrumbProps,
        items
      );

      currentRouteInfo = currRouteInfo;
      isOriginRoute = false;
    }

    this._saveBreadcrumbItemsToLStorage(items, originRouteName);
    this.breadcrumbItems = items;
  }

  /**
   * Retrieves stored breadcrumbs from either fallback crumbs or local storage if available
   *
   * @param {Route} originRouteClass - The route class instance.
   * @param {AkBreadcrumbsController | undefined} originRouteCtrller - The controller for the origin route.
   * @param {Transition['from']} routeFrom - The transition object representing the originating route.
   * @returns {Partial<AkBreadcrumbsItemProps>[]} An array of breadcrumb items.
   */
  private _retrieveStoredBreadcrumbs(
    originRouteClass: Route,
    originRouteCtrller: AkBreadcrumbsController | undefined,
    routeFrom: Transition['from']
  ): Partial<AkBreadcrumbsItemProps>[] {
    // Origin Route Variables
    const originRouteName = originRouteClass.routeName;

    const routeFromName = routeFrom?.name;
    const routeFromCtrller = this._getRouteController(
      routeFromName,
      originRouteClass
    );

    const originCrumbProps =
      this._extractCrumbPropsFromCtrller(originRouteCtrller);

    // Retrieved breadcrumbs info from local storage
    const lastTransInfo = this._getCrumbsTransInfoFromLStorage();
    const lastTransItems = lastTransInfo?.items ?? [];
    const breadcrumbsExist = lastTransItems && lastTransItems.length > 0;
    const lastTransitionedItem = lastTransItems[lastTransItems.length - 1];

    const routeFromCrumbProps =
      this._extractCrumbPropsFromCtrller(routeFromCtrller);

    // NOTE: Cases where fallback crumbs should be utilized or a recomputation should happen
    // SCENARIO A: In cases where same route exists in crumbs but with diff models, return fallback or recalculate breadcrumbs
    // SCENARIO B: If navigation to a page is from a different route group return fallback or an empty array to allow for regenration;
    // SCENARIO C: If navigation to a page is from a root route with same route group. Reason being, navigation to a root route would clear crumb items;
    const originRouteIndexWithoutModelCheck = Number(
      lastTransItems?.findIndex((it) => it.route === originRouteName)
    );

    const originRouteHasDiffModelWithSameRouteInCrumbs =
      originRouteIndexWithoutModelCheck > -1
        ? lastTransItems[originRouteIndexWithoutModelCheck]?.models?.join(
            ':'
          ) !== originCrumbProps?.models?.join(':')
        : false;

    const routeFromAndToTitlesExist =
      originCrumbProps?.title && routeFromCrumbProps?.title;

    const routFromAndRouteToHaveDistinctGroups =
      originCrumbProps?.routeGroup !== routeFromCrumbProps?.routeGroup;

    const transitionFromRootRouteWithSameGroup =
      routeFromCrumbProps?.isRootCrumb && !routFromAndRouteToHaveDistinctGroups;

    if (
      routeFrom &&
      routeFromAndToTitlesExist &&
      (originRouteHasDiffModelWithSameRouteInCrumbs ||
        routFromAndRouteToHaveDistinctGroups ||
        transitionFromRootRouteWithSameGroup)
    ) {
      return (
        originCrumbProps?.fallbackCrumbs?.map((it) => ({
          ...it,
          routeGroup: originCrumbProps.routeGroup,
        })) ?? []
      );
    }

    // NOTE: Cases where retrieved breadcrumbs from local storage can be utilized
    const routeFromIsLastTransitioned =
      lastTransitionedItem?.route === routeFromName;

    const originRouteIsLastCrumbItem =
      lastTransitionedItem?.route === originRouteName;

    const originRouteIndexInCrumbs = this._getRouteIndexInCrumbs(
      lastTransItems,
      originRouteName,
      originCrumbProps
    );

    const routeFromIsASiblingOfOriginRoute = this._checkIfTwoRoutesAreSiblings(
      originRouteName,
      routeFromName,
      originRouteClass
    );

    const canRetrieveBreadcrumbs = routeFrom && breadcrumbsExist;
    const originRouteAlreadyAdded = originRouteIndexInCrumbs > -1;

    // Sibling routes share the same breadcrumbs with origin route
    if (canRetrieveBreadcrumbs && routeFromIsASiblingOfOriginRoute) {
      // If sibling has its own breadcrumbs replace last crumbs with sibling crumb
      if (originCrumbProps.title) {
        return [...lastTransItems.slice(0, -1), originCrumbProps];
      }

      return lastTransItems;
    }

    // The route you're accessing the current page from is a sibling of the last transition
    const routeFromIsASiblingOfLastTransitioned =
      !!lastTransitionedItem?.siblingRoutes?.some(
        (r) => r.includes(String(routeFromName)) || routeFromName?.includes(r)
      );

    // SCENARIO: In cases where origin route hasn't been added before
    if (
      canRetrieveBreadcrumbs &&
      (routeFromIsLastTransitioned || routeFromIsASiblingOfLastTransitioned) &&
      !originRouteAlreadyAdded
    ) {
      if (originCrumbProps.title) {
        return [...lastTransItems, originCrumbProps];
      }

      return lastTransItems;
    }

    // SCENARIO: In cases where origin route has been added before and other items exists after it in stored breadcrumbs
    if (
      canRetrieveBreadcrumbs &&
      (routeFromIsLastTransitioned || routeFromIsASiblingOfLastTransitioned) &&
      originRouteAlreadyAdded
    ) {
      return lastTransItems.slice(0, originRouteIndexInCrumbs + 1);
    }

    return originRouteIsLastCrumbItem ? (lastTransInfo?.items ?? []) : [];
  }

  /**
   * Retrieves the route controller for a given route.
   *
   * @param {string | undefined} routeName - The name of the route.
   * @param {Route} originRouteClass - The route class instance.
   * @param {boolean} [isOriginRoute=false] - Indicates if the route is the origin route.
   * @returns {AkBreadcrumbsController | undefined} The route controller or undefined if not found.
   */
  private _getRouteController(
    routeName: string | undefined,
    originRouteClass: Route,
    isOriginRoute: boolean = false
  ): AkBreadcrumbsController | undefined {
    return (
      isOriginRoute
        ? originRouteClass.controller
        : routeName
          ? originRouteClass.controllerFor(routeName)
          : undefined
    ) as AkBreadcrumbsController;
  }

  /**
   * Determines the next route for generating breadcrumbs.
   *
   * @param {Route} originRouteClass - The route class instance.
   * @param {RouteInfo} currentRouteInfo - The current route information.
   * @param {Transition['from']} routeFrom - The transition object representing the originating route.
   * @param {Partial<AkBreadcrumbsItemProps>} breadcrumbs - The breadcrumbs information.
   * @param {Partial<AkBreadcrumbsItemProps>[]} crumbs - The current breadcrumb items.
   * @returns {RouteInfo | null} The next route information or null if none found.
   */
  private _getNextRouteForCrumbsGeneration(
    originRouteClass: Route,
    currentRouteInfo: RouteInfo,
    routeFrom: Transition['from'],
    breadcrumbProps: Partial<AkBreadcrumbsItemProps>,
    crumbs: Partial<AkBreadcrumbsItemProps>[]
  ): RouteInfo | null {
    const routeFromAlreadyAdded =
      this._getRouteIndexInCrumbs(crumbs, routeFrom?.name, breadcrumbProps) >
      -1;

    const routeFromIsASibling = this._checkIfTwoRoutesAreSiblings(
      currentRouteInfo.name,
      routeFrom?.name,
      originRouteClass
    );

    // RouteFrom is important in routes with multi page access to trace back the crumbs steps down the route the user is accessing from
    if (
      routeFrom &&
      !routeFromAlreadyAdded &&
      !routeFromIsASibling &&
      breadcrumbProps?.multiPageAccess
    ) {
      return routeFrom;
    }

    if (breadcrumbProps?.parentCrumb) {
      return this._getRouteInfoFromCrumb(breadcrumbProps.parentCrumb);
    }

    return currentRouteInfo?.parent;
  }

  /**
   * Saves breadcrumb items to local storage.
   *
   * @param {Partial<AkBreadcrumbsItemProps>[]} items - The breadcrumb items to store.
   * @param {string} route - The route associated with the breadcrumbs.
   * @returns {void}
   */
  private _saveBreadcrumbItemsToLStorage(
    items: Partial<AkBreadcrumbsItemProps>[],
    route: string
  ): void {
    this.window.sessionStorage.setItem(
      'lastBreadcrumbsState',
      JSON.stringify({
        route,
        items,
      })
    );
  }

  /**
   * Retrieves last breadcrumb transition information from local storage.
   *
   * @returns {{ items: Partial<AkBreadcrumbsItemProps>[]; route: string; } | null}
   * An object containing breadcrumb transition information or null if not found.
   */
  private _getCrumbsTransInfoFromLStorage(): {
    items: Partial<AkBreadcrumbsItemProps>[];
    route: string;
  } | null {
    return JSON.parse(
      this.window.sessionStorage.getItem('lastBreadcrumbsState') ?? 'null'
    );
  }

  /**
   * Checks if two routes are siblings.
   *
   * @param {string | undefined} routeA - The first route name.
   * @param {string | undefined} routeB - The second route name.
   * @param {Route} originRouteClass - The route class instance.
   * @returns {boolean} True if the routes are siblings, false otherwise.
   */
  private _checkIfTwoRoutesAreSiblings(
    routeA: string | undefined,
    routeB: string | undefined,
    originRouteClass: Route
  ): boolean {
    const routeACtrller = this._getRouteController(routeA, originRouteClass);
    const routeBCtrller = this._getRouteController(routeB, originRouteClass);

    return (
      this._isSiblingRoute(routeBCtrller, routeA) ||
      this._isSiblingRoute(routeACtrller, routeB)
    );
  }

  /**
   * Checks if a route is a sibling of another based on its controller.
   *
   * @param {AkBreadcrumbsController | undefined} controller - The route controller.
   * @param {string | undefined} routeName - The name of the route.
   * @returns {boolean} True if the route is a sibling, false otherwise.
   */
  private _isSiblingRoute(
    controller: AkBreadcrumbsController | undefined,
    routeName: string | undefined
  ): boolean {
    return (
      controller?.breadcrumbs?.siblingRoutes?.includes(routeName ?? '') || false
    );
  }

  /**
   * Gets the index of a route in the breadcrumb items.
   *
   * @param {Partial<AkBreadcrumbsItemProps>[]} items - The breadcrumb items.
   * @param {string | undefined} routeName - The name of the route.
   * @returns {number} The index of the route in the breadcrumb items or -1 if not found.
   */
  private _getRouteIndexInCrumbs(
    items: Partial<AkBreadcrumbsItemProps>[],
    routeName?: string,
    routeCrumbs?: Partial<AkBreadcrumbsItemProps>
  ): number {
    return Number(
      items?.findIndex(
        (it) =>
          (it.route === routeName ||
            this._addIndexToRoute(it.route) === routeName ||
            it.route?.includes(String(routeName))) &&
          it.models?.join(',') === routeCrumbs?.models?.join(',') &&
          it.title === routeCrumbs?.title
      )
    );
  }

  /**
   * Generates a URL for a route based on breadcrumb properties.
   *
   * @param {Partial<AkBreadcrumbsItemProps>} crumb - The breadcrumb properties.
   * @returns {string} The URL for the route.
   */
  private _getRouteLinkFromCrumbProps(
    crumb: Partial<AkBreadcrumbsItemProps>
  ): string {
    const { route = '', models = [], query = {} } = crumb;

    return this.router.urlFor(route, ...models, {
      queryParams: query,
    });
  }

  /**
   * Retrieves route information from a breadcrumb.
   *
   * @param {Partial<AkBreadcrumbsItemProps>} crumb - The breadcrumb properties.
   * @returns {RouteInfo} The route information.
   */
  private _getRouteInfoFromCrumb(
    crumb: Partial<AkBreadcrumbsItemProps>
  ): RouteInfo {
    return this.router.recognize(this._getRouteLinkFromCrumbProps(crumb));
  }

  /**
   * Appends `.index` to a route name if not already present.
   *
   * @param {string | undefined} route - The route name.
   * @returns {string | undefined} The modified route name with `.index` appended.
   */
  private _addIndexToRoute(route?: string): string | undefined {
    return route?.includes('.index') ? route : `${route}.index`;
  }

  /**
   * Extracts breadcrumb properties from a route controller.
   *
   * @param {AkBreadcrumbsController | undefined} routeController - The route controller.
   * @returns {Partial<AkBreadcrumbsItemProps>} The extracted breadcrumb properties.
   */
  private _extractCrumbPropsFromCtrller(
    routeController?: AkBreadcrumbsController
  ): Partial<AkBreadcrumbsItemProps> {
    const {
      models = [],
      query = {},
      ...props
    } = (routeController?.breadcrumbs ?? {}) as Partial<AkBreadcrumbsItemProps>;

    return { models, query, ...props };
  }
}

declare module '@ember/service' {
  interface Registry {
    'ak-breadcrumbs': AkBreadcrumbsService;
  }
}
