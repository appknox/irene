import { underscore } from '@ember/string';
import { EmberDataSerializer } from 'ember-cli-mirage';

export default EmberDataSerializer.extend({
  keyForAttribute(attr) {
    return underscore(attr);
  },
});
