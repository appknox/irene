import { Page, Route } from '@playwright/test';

export interface PaginatedResDataOverrideProps {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: Array<unknown>;
}

export interface MockRequestOptions {
  method?: string;
  route: string;
  status?: number;
  dataOverride?: object;
}

export default class NetworkActions {
  constructor(private page: Page) {}

  /**
   * Mock any network request with full response override
   * Equivalent to Cypress networkActions.mockNetworkReq
   */
  async mockNetworkReq(opts: MockRequestOptions): Promise<void> {
    const { method = 'GET', route, dataOverride = {}, status = 200 } = opts;

    await this.page.route(`**${route}`, (pwRoute: Route) => {
      if (pwRoute.request().method() !== method) {
        return pwRoute.continue();
      }

      pwRoute.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(dataOverride),
      });
    });
  }

  /**
   * Mock paginated response
   * Equivalent to Cypress networkActions.mockPaginatedNetworkReq
   */
  async mockPaginatedNetworkReq(opts: {
    method?: string;
    route: string;
    resDataOverride?: PaginatedResDataOverrideProps;
  }): Promise<void> {
    const { method = 'GET', route, resDataOverride } = opts;

    await this.page.route(`**${route}`, (pwRoute: Route) => {
      if (pwRoute.request().method() !== method) {
        return pwRoute.continue();
      }

      pwRoute.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          count: resDataOverride?.results?.length ?? 0,
          next: null,
          previous: null,
          ...resDataOverride,
        }),
      });
    });
  }

  /**
   * Wait for a specific response
   * Equivalent to cy.wait('@alias')
   */
  async waitForResponse(
    urlPattern: string,
    expectedStatus = 200
  ): Promise<void> {
    await this.page.waitForResponse(
      (res) => res.url().includes(urlPattern) && res.status() === expectedStatus
    );
  }

  /**
   * Clear all route mocks
   * Call in afterEach to prevent bleed between tests
   */
  async clearAll(): Promise<void> {
    await this.page.unrouteAll();
  }
}
