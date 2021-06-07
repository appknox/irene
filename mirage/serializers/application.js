import { Serializer } from 'ember-cli-mirage';
import { underscore } from '@ember/string';

export default Serializer.extend({
  // embed: true

  keyForAttribute(attr) {
    console.log('attr', attr)
    return underscore(attr);
  }
});
