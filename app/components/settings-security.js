import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  mfas: computed(function() {
    return this.get('store').findAll('mfa');
  })
});
