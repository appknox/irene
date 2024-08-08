// @ts-expect-error no type defs
import SwaggerUI from 'swagger-ui';

import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { tracked } from 'tracked-built-ins';
import parseError from 'irene/utils/parse-error';

import type NetworkService from 'irene/services/network';
import type IntlService from 'ember-intl/services/intl';

export type SwaggerUIDataProps = Partial<
  Record<'components' | 'paths' | 'openapi' | 'info', string | object>
>;

export default class PublicApiDocsComponent extends Component {
  @service declare network: NetworkService;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked data: SwaggerUIDataProps = {};
  @tracked selectedTab = 'apis';

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.fetchSchemaData.perform();
  }

  get tabItems() {
    return [
      {
        id: 'apis',
        label: 'API Endpoints',
        component: 'public-api-docs/api-endpoints' as const,
      },
      {
        id: 'schemas',
        label: 'Schemas',
        component: 'public-api-docs/schemas' as const,
      },
    ];
  }

  get activeTabComponent() {
    return this.tabItems.find((t) => t.id === this.selectedTab)?.component;
  }

  @action
  handleTabClick(id: string | number) {
    this.selectedTab = id as string;
  }

  @action
  intializeSwaggerUI(element: HTMLDivElement) {
    SwaggerUI({
      spec: { ...this.data, paths: {}, components: {} },
      domNode: element,
      presets: [SwaggerUI.presets.apis, SwaggerUI.SwaggerUIStandalonePreset],
    });
  }

  fetchSchemaData = task(async () => {
    try {
      const res = await this.network.request('/api/public_api/schema', {
        headers: { accept: 'application/json, */*' },
      });

      const data = (await res.json()) as SwaggerUIDataProps;

      this.data = data;
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    PublicApiDocs: typeof PublicApiDocsComponent;
  }
}
