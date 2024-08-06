// @ts-expect-error no type defs
import SwaggerUI from 'swagger-ui';

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
    SwaggerUI({
      spec: { ...this.args.data, info: {}, paths: {} },
      domNode: element,
      presets: [SwaggerUI.presets.apis, SwaggerUI.SwaggerUIStandalonePreset],
    });
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'public-api-docs/schemas': typeof PublicApiDocsSchemasComponent;
  }
}
