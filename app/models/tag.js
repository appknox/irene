import DS from 'ember-data';
import { computed } from '@ember/object';
import invert from 'invert-color';

export default DS.Model.extend({
  name: DS.attr('string'),
  color: DS.attr('string'),
  ownedFile: DS.belongsTo('file', { inverse: 'tags' }),

  invertedColor: computed('color', function () {
    return invert(this.get("color", true)); // add true to amplify to black or white
  })

});
