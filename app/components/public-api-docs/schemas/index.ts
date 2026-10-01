import Component from '@glimmer/component';
import { action } from '@ember/object';

import loadSwaggerUI from 'irene/utils/load-swagger-ui';
import loadPublicApiDocsStyles from 'irene/utils/load-public-api-docs-styles';
import { type SwaggerUIDataProps } from '..';

interface PublicApiDocsSchemasSignature {
  Args: {
    data: SwaggerUIDataProps;
  };
}

export default class PublicApiDocsSchemasComponent extends Component<PublicApiDocsSchemasSignature> {
  @action
  async initializeSchemas(element: HTMLDivElement) {
    const [SwaggerUI] = await Promise.all([
      loadSwaggerUI(),
      loadPublicApiDocsStyles(),
    ]);

    if (this.isDestroying) {
      return;
    }

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
