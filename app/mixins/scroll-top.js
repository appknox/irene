/*
 * DS102: Remove unnecessary code created because of implicit returns
 */
import Ember from 'ember';

const ScrollTopMixin = Ember.Mixin.create({
  activate() {
    this._super();
    return window.scrollTo(0,0);
  }
});

export default ScrollTopMixin;
