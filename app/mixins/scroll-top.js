import Mixin from '@ember/object/mixin';

const ScrollTopMixin = Mixin.create({
  activate() {
    this._super();
    window.scrollTo(0,0);
  }
});

export default ScrollTopMixin;
