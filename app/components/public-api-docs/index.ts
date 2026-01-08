// @ts-expect-error no type defs
import SwaggerUI from 'swagger-ui';

import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { tracked } from 'tracked-built-ins';
import type IntlService from 'ember-intl/services/intl';
import { waitForPromise } from '@ember/test-waiters';

import parseError from 'irene/utils/parse-error';
import type MeService from 'irene/services/me';
import type IreneAjaxService from 'irene/services/ajax';

export type SwaggerUIDataProps = Partial<
  Record<
    'components' | 'paths' | 'openapi' | 'info' | 'servers',
    string | object
  >
>;

export default class PublicApiDocsComponent extends Component {
  @service declare ajax: IreneAjaxService;
  @service declare intl: IntlService;
  @service declare me: MeService;
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
      // {
      //   id: 'schemas',
      //   label: 'Schemas',
      //   component: 'public-api-docs/schemas' as const,
      // },
    ];
  }

  get activeTabComponent() {
    return this.tabItems.find((t) => t.id === this.selectedTab)?.component;
  }

  get showServiceAccountBtn() {
    const isOwner = this.me.org?.is_owner;
    const isAdmin = this.me.org?.is_admin;

    return isOwner || isAdmin;
  }

  @action
  handleTabClick(id: string | number) {
    this.selectedTab = id as string;
  }

  @action
  intializeSwaggerUI(element: HTMLDivElement) {
    try {
      SwaggerUI({
        spec: { ...this.data, paths: {}, components: {} },
        domNode: element,
        presets: [SwaggerUI.presets.apis, SwaggerUI.SwaggerUIStandalonePreset],
      });
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  }

  fetchSchemaData = task(async () => {
    try {
      this.data = await waitForPromise(
        this.ajax.request<SwaggerUIDataProps>('/api/public_api/schema', {
          headers: { accept: 'application/json, */*' },
        })
      );
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
