import Component from '@glimmer/component';
import { action } from '@ember/object';

import loadSwaggerUI from 'irene/utils/load-swagger-ui';
import loadPublicApiDocsStyles from 'irene/utils/load-public-api-docs-styles';
import { type SwaggerUIDataProps } from '..';

interface PublicApiDocsApiEndpointsSignature {
  Args: {
    data: SwaggerUIDataProps;
  };
}

export default class PublicApiDocsApiEndpointsComponent extends Component<PublicApiDocsApiEndpointsSignature> {
  @action
  async initializeAPIEndpoints(element: HTMLDivElement) {
    const servers = this.args.data.servers;
    const [SwaggerUI] = await Promise.all([
      loadSwaggerUI(),
      loadPublicApiDocsStyles(),
    ]);

    if (this.isDestroying) {
      return;
    }

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
