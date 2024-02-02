import { Method, RouteMatcher } from 'cypress/types/net-stubbing';

import { mirageServer } from '../../Mirage';
import { API_ROUTES } from '../../api.routes';

export interface PaginatedReqDataOverrideProps {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: Array<unknown>;
}

export default class NetworkActions {
  hideNetworkLogsFor(opts: { route: RouteMatcher; method?: Method }) {
    return cy.intercept(opts.method || 'GET', opts.route, { log: false });
  }

  mockNetworkReq(opts: {
    method?: Method;
    route: RouteMatcher;
    alias: string;
    dataOverride?: object;
  }) {
    const { method, route, dataOverride, alias } = opts;

    return cy
      .intercept(method || 'GET', route, async (req) => {
        req.reply({ ...dataOverride });
      })
      .as(alias);
  }

  mockPaginatedNetworkReq(opts: {
    method?: Method;
    route: RouteMatcher;
    alias: string;
    resDataOverride?: PaginatedReqDataOverrideProps;
  }) {
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

  loadAppConfigWithCustomData(dataOverride?: {
    serverConfig?: object;
    frontendConfig?: object;
  }) {
    const { serverConfig, frontendConfig } = dataOverride || {};

    if (serverConfig) {
      this.mockNetworkReq({
        ...API_ROUTES.serverConfig,
        dataOverride: serverConfig,
      });
    }

    if (frontendConfig) {
      this.mockNetworkReq({
        ...API_ROUTES.frontendConfig,
        dataOverride: frontendConfig,
      });
    }
  }

  loadAppConfigWithMockData() {
    cy.fixture('common/server_config.json').then((data) => {
      this.mockNetworkReq({
        ...API_ROUTES.serverConfig,
        dataOverride: data,
      });
    });

    cy.fixture('common/frontend_config.json').then((data) => {
      this.mockNetworkReq({
        ...API_ROUTES.frontendConfig,
        dataOverride: data,
      });
    });
  }

  /**
   *  Loads Hudson projects with mock data
   */
  loadMockHudsonProjects() {
    const projects = mirageServer.createRecordList('project', 4).map((_) => ({
      id: _?.['id'],
      package_name: _?.['package_name'],
      is_manual_scan_available: _?.['is_manual_scan_available'],
    }));

    this.mockPaginatedNetworkReq({
      ...API_ROUTES.hudsonProjectList,
      resDataOverride: {
        count: projects?.length || 0,
        results: projects,
      },
    });
  }
}
