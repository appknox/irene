`import Ember from 'ember'`

ScrollTopMixin = Ember.Mixin.create
  activate: ->
    this._super()
    window.scrollTo(0,0)

`export default ScrollTopMixin`
