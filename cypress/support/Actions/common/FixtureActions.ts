import { Method } from 'cypress/types/net-stubbing';
import { modelFactories } from '../../../fixtures/factories';
import { PaginatedReqDataOverrideProps } from './NetworkActions';
import NetworkActions from './NetworkActions';

const network = new NetworkActions();

type ReqMockFixtureFnProps = {
  fixturePath: string;
  route: string;
  alias: string;
  method?: Method;
};

export default class FixtureActions {
  generateModelFixture(modelName: Cypress.modelFactoriesName, dataSize = 1) {
    return cy.writeFile(
      `cypress/fixtures/models/${modelName}.json`,
      Cypress._.times(dataSize, (id) => modelFactories[modelName](id + 1))
    );
  }

  loadFixture(path: string) {
    return cy.fixture(path);
  }

  replyReqWithFixtureData({
    fixturePath,
    route,
    alias,
    method,
    dataOverride,
  }: ReqMockFixtureFnProps & { dataOverride?: object }) {
    return this.loadFixture(fixturePath).then((data) => {
      network.mockNetworkReq(method || 'GET', route, alias, {
        data,
        ...dataOverride,
      });
    });
  }

  replyReqWithPaginatedFixtureData({
    fixturePath,
    route,
    alias,
    method,
    responseOverrideData,
  }: ReqMockFixtureFnProps & {
    responseOverrideData?: PaginatedReqDataOverrideProps;
  }) {
    return this.loadFixture(fixturePath).then((data) => {
      network.mockPaginatedNetworkReq(method || 'GET', route, alias, {
        count: 0,
        next: null,
        previous: null,
        results: data,
        ...responseOverrideData,
      });
    });
  }
}
