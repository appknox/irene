import {
  CyHttpMessages,
  Method,
  RouteMatcher,
} from 'cypress/types/net-stubbing';

import { mirageServer } from '../../Mirage';
import { API_ROUTES } from '../../api.routes';

import {
  extractDynamicSlugs,
  removeHostFromUrl,
  replaceSlugsWithAsterisks,
} from '../../utils';

// Override props for paginated routes that are mocked
export interface PaginatedReqDataOverrideProps {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: Array<unknown>;
}

export default class NetworkActions {
  /**
   * Hide network logs for a specific route.
   *
   * @param {Object} opts - Options for hiding network logs.
   * @param {RouteMatcher} opts.route - The route to hide logs for.
   * @param {Method} [opts.method='GET'] - The HTTP method for the interception (default is 'GET').
   *
   * @returns {Cypress.Chainable} - The Cypress chainable object for chaining further commands.
   *
   * @example
   * // Hide network logs for GET requests to "/api/data"
   * hideNetworkLogsFor({
   *   route: "/api/data",
   *   method: 'GET'
   * });
   */
  hideNetworkLogsFor(opts: {
    route: RouteMatcher;
    method?: Method;
  }): Cypress.Chainable {
    return cy.intercept(opts.method || 'GET', opts.route, { log: false });
  }

  /**
   * Mock a network request.
   *
   * @param {Object} opts - Options for mocking the network request.
   * @param {Method} [opts.method='GET'] - The HTTP method for the interception (default is 'GET').
   * @param {RouteMatcher} opts.route - The route to mock the request for.
   * @param {string} opts.alias - The alias to give to the intercepted route for later reference.
   * @param {object} [opts.dataOverride] - Optional data to override the response payload.
   *
   * @returns {Cypress.Chainable} - The Cypress chainable object for chaining further commands.
   *
   * @example
   * // Mock a GET request to "/api/data" with a specific alias and response data override
   * mockNetworkReq({
   *   method: 'GET',
   *   route: "/api/data",
   *   alias: "getData",
   *   dataOverride: { status: "success", data: { id: 123, name: "Example" } }
   * });
   */
  mockNetworkReq(opts: {
    method?: Method;
    route: RouteMatcher;
    alias: string;
    dataOverride?: object;
  }): Cypress.Chainable {
    const { method, route, dataOverride, alias } = opts;

    return cy
      .intercept(method || 'GET', route, async (req) => {
        req.reply({ ...dataOverride });
      })
      .as(alias);
  }

  /**
   * Mock a paginated network request.
   *
   * @param {Object} opts - Options for mocking the paginated network request.
   * @param {Method} [opts.method='GET'] - The HTTP method for the interception (default is 'GET').
   * @param {RouteMatcher} opts.route - The route to mock the paginated request for.
   * @param {string} opts.alias - The alias to give to the intercepted route for later reference.
   * @param {PaginatedReqDataOverrideProps} [opts.resDataOverride] - Optional data to override the response payload.
   *
   * @returns {Cypress.Chainable} - The Cypress chainable object for chaining further commands.
   *
   * @example
   * // Mock a paginated GET request to "/api/data" with a specific alias and response data override
   * mockPaginatedNetworkReq({
   *   method: 'GET',
   *   route: "/api/data",
   *   alias: "getPaginatedData",
   *   resDataOverride: {
   *     results: [
   *       { id: 1, name: "Example 1" },
   *       { id: 2, name: "Example 2" }
   *     ],
   *     // other pagination properties
   *   }
   * });
   */
  mockPaginatedNetworkReq(opts: {
    method?: Method;
    route: RouteMatcher;
    alias: string;
    resDataOverride?: PaginatedReqDataOverrideProps;
  }): Cypress.Chainable {
    const { method, route, resDataOverride, alias } = opts;

    return cy
      .intercept(method || 'GET', route, async (req) => {
        req.reply({
          count: resDataOverride?.results?.length || 0,
          next: null,
          previous: null,
          ...resDataOverride,
        });
      })
      .as(alias);
  }

  /**
   * Load application configuration with fixture data.
   *
   * @returns {Object} - An object containing aliases for the intercepted routes.
   * @property {string} frontendConfigAlias - Alias for the frontend configuration route.
   * @property {string} serverConfigAlias - Alias for the server configuration route.
   *
   * @example
   * // Load application configuration with fixture data and get aliases for further use
   * const aliases = loadAppConfigWithFixtureData();
   * // Now you can use aliases.frontendConfigAlias and aliases.serverConfigAlias in your tests
   */
  loadAppConfigWithFixtureData(): object {
    const frontendConfigAlias = API_ROUTES.frontendConfig.alias;
    const serverConfigAlias = API_ROUTES.serverConfig.alias;

    cy.fixture('common/server_config.json').then((data) => {
      this.mockNetworkReq({
        route: API_ROUTES.serverConfig.route,
        alias: serverConfigAlias,
        dataOverride: data,
      });
    });

    cy.fixture('common/frontend_config.json').then((data) => {
      this.mockNetworkReq({
        route: API_ROUTES.frontendConfig.route,
        alias: frontendConfigAlias,
        dataOverride: data,
      });
    });

    return {
      frontendConfigAlias,
      serverConfigAlias,
    };
  }

  /**
   *  Loads Hudson projects with mock data
   */
  loadMockHudsonProjects() {
    const projects = mirageServer.createRecordList('project', 4).map((prj) => ({
      id: prj?.id,
      package_name: prj?.package_name,
      is_manual_scan_available: prj?.is_manual_scan_available,
    }));

    this.mockPaginatedNetworkReq({
      ...API_ROUTES.hudsonProjectList,
      resDataOverride: {
        count: projects?.length || 0,
        results: projects,
      },
    });
  }

  /**
   * Intercept a parameterized route
   *
   * @template ParamObj - The type of the parameters available in URL.
   *
   * @param {Object} opts - Options for intercepting the route.
   * @param {string} opts.route - The parameterized route to intercept.
   * @param {Method} [opts.method='GET'] - The HTTP method for the interception (default is 'GET').
   * @param {(req: CyHttpMessages.IncomingHttpRequest, params: ParamObj) => Promise<void>} [opts.routeHandler] -
   *   The route handler function that will be called when the route is intercepted.
   *   It receives the request and the extracted dynamic parameters.
   *
   * @returns {Cypress.Chainable} - The Cypress chainable object for chaining further commands.
   *
   * @example
   * // Intercept a POST request to "/path/:id/:name"
   * interceptParameterizedRoute({
   *   route: "/path/:id/:name",
   *   routeHandler: async (req, params) => {
   *     console.log("Dynamic Parameters:", params);
   *     // Perform actions based on dynamic parameters
   *   },
   *   method: "POST"
   * });
   */
  interceptParameterizedRoute<ParamObj>(opts: {
    route: string;
    method?: Method;

    routeHandler?: (
      req: CyHttpMessages.IncomingHttpRequest,
      params: ParamObj
    ) => Promise<void>;
  }): Cypress.Chainable {
    const { method, route, routeHandler } = opts;

    // The Asterisk is necessary to match query params if available
    const routeToIntercept = `${replaceSlugsWithAsterisks(route)}*`;

    return cy.intercept(method || 'GET', routeToIntercept, async (req) => {
      const path = removeHostFromUrl(req.url);
      const params = extractDynamicSlugs<ParamObj>(route, path);

      await routeHandler?.(req, params);
    });
  }
}
