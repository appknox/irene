import ENV from 'irene/config/environment';
import { JSONAPIAuthenticationBase } from './auth-base';

export default class ApplicationAdapter extends JSONAPIAuthenticationBase {
  host = ENV.host;
  namespace = ENV.namespace;
}
