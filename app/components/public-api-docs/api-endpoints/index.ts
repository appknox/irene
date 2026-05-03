// @ts-expect-error no type defs
import { SwaggerUIBundle, SwaggerUIStandalonePreset } from 'swagger-ui-dist';
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

    SwaggerUIBundle({
      spec: { ...this.args.data, info: {}, servers },
      domNode: element,
      presets: [SwaggerUIBundle['presets'].apis, SwaggerUIStandalonePreset],
    });
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'public-api-docs/api-endpoints': typeof PublicApiDocsApiEndpointsComponent;
  }
}
