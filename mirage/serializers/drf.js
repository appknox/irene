import { underscore } from '@ember/string';
import { EmberDataSerializer } from 'ember-cli-mirage';

export default EmberDataSerializer.extend({
  keyForAttribute(attr) {
    return underscore(attr);
  },
  getTransformForSerialize(key) {
    const resolvedTransforms = this.getResolvedTransforms();
    const transforms = this.getTransforms();

    if (!resolvedTransforms.serialize[key]) {
      const transform =
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
