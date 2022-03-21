/* eslint-disable prettier/prettier */
import { helper } from '@ember/component/helper';

export function requestToUrl(params) {
  try {
    const req = params[0];
    const port = (['80', '443'].indexOf(String(req.port)) !== -1) ? '': `:${req.port}`;
    const requiredFields = ['scheme', 'host', 'port', 'path'];
    if (requiredFields.every(f => f in req)) {
      return `${req.scheme}://${req.host}${port}${req.path}`;
    }
    return '';
  } catch (_) {
    return '';
  }

}

export default helper(requestToUrl);
