import { helper } from '@ember/component/helper';
import type { Request } from 'irene/models/capturedapi';

export function requestToUrl(params: [Request]) {
  try {
    const req = params[0];
    const port =
      ['80', '443'].indexOf(String(req.port)) !== -1 ? '' : `:${req.port}`;
    const requiredFields = ['scheme', 'host', 'port', 'path'];
    if (requiredFields.every((f) => f in req)) {
      return `${req.scheme}://${req.host}${port}${req.path}`;
    }
    return '';
  } catch (_) {
    return '';
  }
}

const RequestToUrlHelper = helper(requestToUrl);

export default RequestToUrlHelper;

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'request-to-url': typeof RequestToUrlHelper;
  }
}
