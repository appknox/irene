/* eslint-disable ember/no-new-mixins, prettier/prettier */
import Mixin from '@ember/object/mixin';

const ScrollTopMixinOld = Mixin.create({
  activate() {
    this._super();
    window.scrollTo(0, 0);
  },
});

export const ScrollTopMixin = (superclass) =>
  class extends superclass {
    activate() {
      super.activate(...arguments);
      window.scrollTo(0, 0);
    }
  };

export default ScrollTopMixinOld;
