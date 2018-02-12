/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import Ember from 'ember';

const ScrollTopMixin = Ember.Mixin.create({
  activate() {
    this._super();
    return window.scrollTo(0,0);
  }
});

export default ScrollTopMixin;
