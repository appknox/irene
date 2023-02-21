import { underscore } from '@ember/string';
import { EmberDataSerializer } from 'ember-cli-mirage';

export default EmberDataSerializer.extend({
  keyForAttribute(attr) {
    return underscore(attr);
  },
  getTransformForSerialize(key) {
    let resolvedTransforms = this.getResolvedTransforms();
    let transforms = this.getTransforms();

    if (!resolvedTransforms.serialize[key]) {
      let transform =
        typeof transforms[key] === 'string'
          ? { key: transforms[key] }
          : Object.assign({}, transforms[key]);

      resolvedTransforms.serialize[key] = Object.assign(
        { key: underscore(key), serialize: 'ids', deserialize: 'ids' },
        transform
      );
    }

    return resolvedTransforms.serialize[key];
  },
});
