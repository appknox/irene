// @ts-expect-error no type defs
import { SwaggerUIBundle, SwaggerUIStandalonePreset } from 'swagger-ui-dist';

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { type SwaggerUIDataProps } from '..';

interface PublicApiDocsSchemasSignature {
  Args: {
    data: SwaggerUIDataProps;
  };
}

export default class PublicApiDocsSchemasComponent extends Component<PublicApiDocsSchemasSignature> {
  @action
  initializeSchemas(element: HTMLDivElement) {
    SwaggerUIBundle({
      spec: { ...this.args.data, info: {}, paths: {} },
      domNode: element,
      presets: [SwaggerUIBundle['presets'].apis, SwaggerUIStandalonePreset],
    });
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'public-api-docs/schemas': typeof PublicApiDocsSchemasComponent;
  }
}
