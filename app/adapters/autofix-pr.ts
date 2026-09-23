import ENV from 'irene/config/environment';
import CommonDRFAdapter from './commondrf';

export interface AutofixPRQuery {
  projectId?: string | number;
  fileId?: string | number;
  file_id?: string | number;
  limit?: string | number;
  offset?: string | number;
}

export default class AutofixPRAdapter extends CommonDRFAdapter {
  urlForQuery(query: AutofixPRQuery) {
    const { projectId, fileId } = query;

    delete query.projectId;
    delete query.fileId;

    if (fileId != null) {
      query.file_id = fileId;
    }

    const url = `${this.namespace}/knoxiq/project/${projectId}/${ENV.endpoints['autofixPrs']}/`;

    return this.buildURLFromBase(url);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'autofix-pr': AutofixPRAdapter;
  }
}
