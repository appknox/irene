// @ts-expect-error no type defs
import SwaggerUI from 'swagger-ui';
import Component from '@glimmer/component';
import { action } from '@ember/object';

import { type SwaggerUIDataProps } from '..';

interface PublicApiDocsApiEndpointsSignature {
  Args: {
    data: SwaggerUIDataProps;
  };
}

export default class PublicApiDocsApiEndpointsComponent extends Component<PublicApiDocsApiEndpointsSignature> {
  @action
  initializeAPIEndpoints(element: HTMLDivElement) {
    const servers = this.args.data.servers;

    SwaggerUI({
      spec: { ...this.args.data, info: {}, servers },
      domNode: element,
      presets: [SwaggerUI.presets.apis, SwaggerUI.SwaggerUIStandalonePreset],
    });
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'public-api-docs/api-endpoints': typeof PublicApiDocsApiEndpointsComponent;
  }
}
