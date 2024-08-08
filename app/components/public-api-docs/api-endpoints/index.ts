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
    SwaggerUI({
      spec: { ...this.args.data, info: {} },
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
