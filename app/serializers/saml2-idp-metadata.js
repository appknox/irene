/* eslint-disable prettier/prettier */
import DRFSerializer from './drf';

export default DRFSerializer.extend({
  modelNameFromPayloadKey() {
    return 'saml2-idp-metadata';
  }
});
